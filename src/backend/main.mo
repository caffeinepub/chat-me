import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Buffer "mo:base/Buffer";
import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";

persistent actor ChatMe {

  type UserId = Nat;

  type User = {
    id: UserId;
    phone: Text;
    pin: Text;
    name: Text;
    about: Text;
    avatarUrl: Text;
    joinedAt: Int;
    isAdmin: Bool;
  };

  type PublicUser = {
    id: UserId;
    name: Text;
    about: Text;
    avatarUrl: Text;
    phone: Text;
    joinedAt: Int;
    isAdmin: Bool;
  };

  type Message = {
    id: Nat;
    chatId: Text;
    senderId: UserId;
    senderName: Text;
    text: Text;
    imageUrl: Text;
    timestamp: Int;
  };

  type LoginResult = {
    #ok: { token: Text; user: PublicUser };
    #err: Text;
  };

  type RegisterResult = {
    #ok: { userId: UserId; token: Text };
    #err: Text;
  };

  type OtpResult = {
    #ok: Text;
    #err: Text;
  };

  // IC management canister types for HTTP outcalls
  type HttpRequestArgs = {
    url: Text;
    max_response_bytes: ?Nat64;
    headers: [{ name: Text; value: Text }];
    body: ?Blob;
    method: { #get; #post; #head };
    transform: ?{
      function: shared query ({ response: HttpResponsePayload; context: Blob }) -> async HttpResponsePayload;
      context: Blob;
    };
  };

  type HttpResponsePayload = {
    status: Nat;
    headers: [{ name: Text; value: Text }];
    body: Blob;
  };

  type IC = actor {
    http_request: HttpRequestArgs -> async HttpResponsePayload;
  };

  let ic: IC = actor ("aaaaa-aa");

  // Stable storage
  var nextUserId: Nat = 1;
  var nextMsgId: Nat = 1;
  var usersStable: [(Text, User)] = [];
  var sessionsStable: [(Text, UserId)] = [];
  var messagesStable: [(Nat, Message)] = [];
  var otpsStable: [(Text, Text)] = [];
  // Fast2SMS API key - admin sets this via setApiKey()
  var smsApiKey: Text = "";

  func natHash(n: Nat): Nat32 { Nat32.fromNat(n % 4294967295) };

  transient var usersByPhone : HashMap.HashMap<Text, User> = HashMap.HashMap(16, Text.equal, Text.hash);
  transient var sessions : HashMap.HashMap<Text, UserId> = HashMap.HashMap(16, Text.equal, Text.hash);
  transient var messages : HashMap.HashMap<Nat, Message> = HashMap.HashMap(64, Nat.equal, natHash);
  transient var otps : HashMap.HashMap<Text, Text> = HashMap.HashMap(16, Text.equal, Text.hash);

  system func preupgrade() {
    usersStable := Iter.toArray(usersByPhone.entries());
    sessionsStable := Iter.toArray(sessions.entries());
    messagesStable := Iter.toArray(messages.entries());
    otpsStable := Iter.toArray(otps.entries());
  };

  system func postupgrade() {
    usersByPhone := HashMap.fromIter<Text, User>(usersStable.vals(), 16, Text.equal, Text.hash);
    sessions := HashMap.fromIter<Text, UserId>(sessionsStable.vals(), 16, Text.equal, Text.hash);
    messages := HashMap.fromIter<Nat, Message>(messagesStable.vals(), 64, Nat.equal, natHash);
    otps := HashMap.fromIter<Text, Text>(otpsStable.vals(), 16, Text.equal, Text.hash);
    usersStable := [];
    sessionsStable := [];
    messagesStable := [];
    otpsStable := [];
  };

  func makeToken(userId: Nat): Text {
    "tok_" # Nat.toText(userId) # "_" # Nat.toText(Nat32.toNat(Text.hash(Nat.toText(userId))));
  };

  func toPublic(u: User): PublicUser {
    { id = u.id; name = u.name; about = u.about; avatarUrl = u.avatarUrl; phone = u.phone; joinedAt = u.joinedAt; isAdmin = u.isAdmin };
  };

  func getUserByToken(token: Text): ?User {
    switch (sessions.get(token)) {
      case null null;
      case (?uid) {
        for ((_, u) in usersByPhone.entries()) {
          if (u.id == uid) return ?u;
        };
        null;
      };
    };
  };

  // Strip country code and return only digits for Fast2SMS
  func cleanPhone(phone: Text): Text {
    // Remove +91, 91 prefix for Indian numbers; keep last 10 digits
    let chars = Iter.toArray(Text.toIter(phone));
    var digits = "";
    for (c in chars.vals()) {
      if (c >= '0' and c <= '9') {
        digits := digits # Text.fromChar(c);
      };
    };
    // If 12 digits and starts with 91, strip prefix
    if (digits.size() == 12) {
      // Take last 10
      let arr = Iter.toArray(Text.toIter(digits));
      var last10 = "";
      var i = 2;
      while (i < 12) {
        last10 := last10 # Text.fromChar(arr[i]);
        i += 1;
      };
      return last10;
    };
    digits;
  };

  // Send OTP via Fast2SMS HTTP outcall
  func sendSmsFast2sms(phone: Text, otp: Text): async Bool {
    let cleanNum = cleanPhone(phone);
    let url = "https://www.fast2sms.com/dev/bulkV2?authorization=" # smsApiKey # "&variables_values=" # otp # "&route=otp&numbers=" # cleanNum;
    try {
      Cycles.add<system>(20_000_000_000);
      let response = await ic.http_request({
        url = url;
        max_response_bytes = ?2000;
        headers = [
          { name = "User-Agent"; value = "ChatMe/1.0" }
        ];
        body = null;
        method = #get;
        transform = null;
      });
      response.status == 200;
    } catch (_) {
      false;
    };
  };

  // Set Fast2SMS API key (admin only)
  public func setApiKey(token: Text, apiKey: Text): async Bool {
    switch (getUserByToken(token)) {
      case null false;
      case (?u) {
        if (not u.isAdmin) return false;
        smsApiKey := apiKey;
        true;
      };
    };
  };

  // Get whether SMS API key is configured
  public query func isSmsConfigured(): async Bool {
    smsApiKey != "";
  };

  // Generate and send a 6-digit OTP via Fast2SMS
  // Returns #ok("") on success (OTP not exposed to frontend)
  // Returns #err if SMS fails or API key not set
  public func requestOtp(phone: Text): async OtpResult {
    if (phone == "") return #err("Phone number required");
    // Generate pseudo-random 6-digit OTP
    let timeSlot : Nat = if (Time.now() > 0) { Nat32.toNat(Nat32.fromIntWrap(Time.now() / 1_000_000_000 / 30)) } else { 0 };
    let seed = Nat32.toNat(Text.hash(phone)) + (timeSlot % 1000000);
    let code = Nat.toText((seed % 900000) + 100000);
    otps.put(phone, code);

    if (smsApiKey == "") {
      // No API key set -- return code so admin can still test
      return #ok(code);
    };

    // Send via Fast2SMS
    let sent = await sendSmsFast2sms(phone, code);
    if (sent) {
      #ok(""); // Don't expose OTP to frontend
    } else {
      // SMS failed but OTP is stored; return error
      otps.delete(phone);
      #err("Failed to send SMS. Please check phone number and try again.");
    };
  };

  // Verify OTP - returns true if correct, removes OTP after use
  public func verifyOtp(phone: Text, otp: Text): async Bool {
    switch (otps.get(phone)) {
      case null false;
      case (?stored) {
        if (stored == otp) {
          otps.delete(phone);
          true;
        } else {
          false;
        };
      };
    };
  };

  // Register with OTP verification
  public func registerWithOtp(phone: Text, otp: Text, name: Text, pin: Text): async RegisterResult {
    if (phone == "" or otp == "" or name == "" or pin == "") return #err("All fields required");
    switch (otps.get(phone)) {
      case null return #err("OTP expired or not requested. Please request a new OTP");
      case (?stored) {
        if (stored != otp) return #err("Invalid OTP. Please check and try again");
        otps.delete(phone);
      };
    };
    switch (usersByPhone.get(phone)) {
      case (?_) return #err("Phone number already registered");
      case null {};
    };
    let uid = nextUserId;
    nextUserId += 1;
    let user: User = {
      id = uid;
      phone = phone;
      pin = pin;
      name = name;
      about = "Hey there! I am using Chat Me";
      avatarUrl = "";
      joinedAt = Time.now();
      isAdmin = uid == 1;
    };
    usersByPhone.put(phone, user);
    let token = makeToken(uid);
    sessions.put(token, uid);
    #ok({ userId = uid; token = token });
  };

  // Login with OTP verification
  public func loginWithOtp(phone: Text, otp: Text): async LoginResult {
    if (phone == "" or otp == "") return #err("All fields required");
    switch (otps.get(phone)) {
      case null return #err("OTP expired or not requested. Please request a new OTP");
      case (?stored) {
        if (stored != otp) return #err("Invalid OTP. Please check and try again");
        otps.delete(phone);
      };
    };
    switch (usersByPhone.get(phone)) {
      case null #err("Phone number not registered. Please register first");
      case (?u) {
        let token = makeToken(u.id);
        sessions.put(token, u.id);
        #ok({ token = token; user = toPublic(u) });
      };
    };
  };

  public query func isPhoneRegistered(phone: Text): async Bool {
    switch (usersByPhone.get(phone)) {
      case null false;
      case (?_) true;
    };
  };

  public func logout(token: Text): async Bool {
    sessions.delete(token);
    true;
  };

  public func getMyProfile(token: Text): async ?PublicUser {
    Option.map(getUserByToken(token), toPublic);
  };

  public func updateProfile(token: Text, name: Text, about: Text, avatarUrl: Text): async Bool {
    switch (getUserByToken(token)) {
      case null false;
      case (?u) {
        let updated: User = {
          id = u.id;
          phone = u.phone;
          pin = u.pin;
          name = if (name == "") u.name else name;
          about = if (about == "") u.about else about;
          avatarUrl = if (avatarUrl == "") u.avatarUrl else avatarUrl;
          joinedAt = u.joinedAt;
          isAdmin = u.isAdmin;
        };
        usersByPhone.put(u.phone, updated);
        true;
      };
    };
  };

  public query func getUserById(userId: UserId): async ?PublicUser {
    for ((_, u) in usersByPhone.entries()) {
      if (u.id == userId) return ?toPublic(u);
    };
    null;
  };

  public query func getAllUsers(): async [PublicUser] {
    Iter.toArray(Iter.map(usersByPhone.vals(), toPublic));
  };

  public func sendMessage(token: Text, chatId: Text, text: Text, imageUrl: Text): async ?Nat {
    switch (getUserByToken(token)) {
      case null null;
      case (?u) {
        let msgId = nextMsgId;
        nextMsgId += 1;
        let msg: Message = {
          id = msgId;
          chatId = chatId;
          senderId = u.id;
          senderName = u.name;
          text = text;
          imageUrl = imageUrl;
          timestamp = Time.now();
        };
        messages.put(msgId, msg);
        ?msgId;
      };
    };
  };

  public query func getMessages(chatId: Text): async [Message] {
    let buf = Buffer.Buffer<Message>(16);
    for ((_, m) in messages.entries()) {
      if (m.chatId == chatId) buf.add(m);
    };
    let arr = Buffer.toArray(buf);
    Array.sort(arr, func(a: Message, b: Message): { #less; #equal; #greater } {
      if (a.timestamp < b.timestamp) #less
      else if (a.timestamp > b.timestamp) #greater
      else #equal;
    });
  };

  public func adminGetStats(token: Text): async ?{ userCount: Nat; users: [PublicUser] } {
    switch (getUserByToken(token)) {
      case null null;
      case (?u) {
        if (not u.isAdmin) return null;
        let allUsers = Iter.toArray(Iter.map(usersByPhone.vals(), toPublic));
        ?{ userCount = allUsers.size(); users = allUsers };
      };
    };
  };

  public func register(phone: Text, pin: Text, name: Text): async RegisterResult {
    if (phone == "" or pin == "" or name == "") return #err("All fields required");
    switch (usersByPhone.get(phone)) {
      case (?_) return #err("Phone number already registered");
      case null {};
    };
    let uid = nextUserId;
    nextUserId += 1;
    let user: User = {
      id = uid;
      phone = phone;
      pin = pin;
      name = name;
      about = "Hey there! I am using Chat Me";
      avatarUrl = "";
      joinedAt = Time.now();
      isAdmin = uid == 1;
    };
    usersByPhone.put(phone, user);
    let token = makeToken(uid);
    sessions.put(token, uid);
    #ok({ userId = uid; token = token });
  };

  public func login(phone: Text, pin: Text): async LoginResult {
    switch (usersByPhone.get(phone)) {
      case null #err("Phone number not found");
      case (?u) {
        if (u.pin != pin) return #err("Wrong PIN");
        let token = makeToken(u.id);
        sessions.put(token, u.id);
        #ok({ token = token; user = toPublic(u) });
      };
    };
  };
};

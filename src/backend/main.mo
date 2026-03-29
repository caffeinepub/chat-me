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
import Char "mo:base/Char";

persistent actor ChatMe {

  type UserId = Nat;

  // V1 user type -- kept for stable var compatibility
  type UserV1 = {
    id: UserId;
    phone: Text;
    pin: Text;
    name: Text;
    about: Text;
    avatarUrl: Text;
    joinedAt: Int;
    isAdmin: Bool;
  };

  // V2 user type (had username but still phone-keyed) -- kept for stable var compatibility
  type UserV2 = {
    id: UserId;
    phone: Text;
    pin: Text;
    name: Text;
    username: Text;
    about: Text;
    avatarUrl: Text;
    joinedAt: Int;
    isAdmin: Bool;
  };

  // Current user type: password-based, id-keyed
  type User = {
    id: UserId;
    username: Text;
    password: Text;
    name: Text;
    about: Text;
    avatarUrl: Text;
    phone: Text;
    joinedAt: Int;
    isAdmin: Bool;
  };

  type PublicUser = {
    id: UserId;
    username: Text;
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

  type HttpResponsePayload = {
    status: Nat;
    headers: [{ name: Text; value: Text }];
    body: Blob;
  };

  type TransformArgs = {
    response: HttpResponsePayload;
    context: Blob;
  };

  type HttpRequestArgs = {
    url: Text;
    max_response_bytes: ?Nat64;
    headers: [{ name: Text; value: Text }];
    body: ?Blob;
    method: { #get; #post; #head };
    transform: ?{
      function: shared query (TransformArgs) -> async HttpResponsePayload;
      context: Blob;
    };
  };

  type IC = actor {
    http_request: HttpRequestArgs -> async HttpResponsePayload;
  };

  let ic: IC = actor ("aaaaa-aa");

  public query func transformHttpResponse(args: TransformArgs): async HttpResponsePayload {
    { status = args.response.status; body = args.response.body; headers = [] };
  };

  var nextUserId: Nat = 1;
  var nextMsgId: Nat = 1;
  var smsApiKey: Text = "Sg3vELGdycTE87SwuoAGIlnKB2h4ndN20zuhAKyWesTeLZ5eup84KUwhTTnu";

  // Old stable vars -- kept with original types for upgrade compatibility
  var usersStable: [(Text, UserV1)] = [];
  var usersStableV2: [(Text, UserV2)] = [];
  // New stable var keyed by UserId
  var usersStableV3: [(UserId, User)] = [];

  var sessionsStable: [(Text, UserId)] = [];
  var messagesStable: [(Nat, Message)] = [];
  var otpsStable: [(Text, Text)] = [];
  var wallpapersStable: [(Text, Text)] = [];

  func natHash(n: Nat): Nat32 { Nat32.fromNat(n % 4294967295) };

  transient var usersById : HashMap.HashMap<UserId, User> = HashMap.HashMap(16, Nat.equal, natHash);
  transient var sessions : HashMap.HashMap<Text, UserId> = HashMap.HashMap(16, Text.equal, Text.hash);
  transient var messages : HashMap.HashMap<Nat, Message> = HashMap.HashMap(64, Nat.equal, natHash);
  transient var otps : HashMap.HashMap<Text, Text> = HashMap.HashMap(16, Text.equal, Text.hash);
  transient var chatWallpapers : HashMap.HashMap<Text, Text> = HashMap.HashMap(16, Text.equal, Text.hash);

  func makeAutoUsername(name: Text, uid: Nat): Text {
    var base = "";
    for (c in Text.toIter(name)) {
      if ((c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or (c >= '0' and c <= '9')) {
        base := base # Text.fromChar(c);
      };
    };
    if (base.size() == 0) { base := "user"; };
    if (base.size() > 12) {
      let arr = Iter.toArray(Text.toIter(base));
      base := "";
      var i = 0;
      while (i < 12) { base := base # Text.fromChar(arr[i]); i += 1; };
    };
    base # Nat.toText(uid);
  };

  system func preupgrade() {
    usersStableV3 := Iter.toArray(usersById.entries());
    sessionsStable := Iter.toArray(sessions.entries());
    messagesStable := Iter.toArray(messages.entries());
    otpsStable := Iter.toArray(otps.entries());
    wallpapersStable := Iter.toArray(chatWallpapers.entries());
    // Clear old format stable vars
    usersStable := [];
    usersStableV2 := [];
  };

  system func postupgrade() {
    if (usersStableV3.size() > 0) {
      usersById := HashMap.fromIter<UserId, User>(usersStableV3.vals(), 16, Nat.equal, natHash);
    } else if (usersStableV2.size() > 0) {
      // Migrate from V2 (phone-keyed, had pin field) to new format (id-keyed, password field)
      let buf = Buffer.Buffer<(UserId, User)>(usersStableV2.size());
      for ((_, v2) in usersStableV2.vals()) {
        let u: User = {
          id = v2.id; username = if (v2.username == "") makeAutoUsername(v2.name, v2.id) else v2.username;
          password = v2.pin; name = v2.name; about = v2.about;
          avatarUrl = v2.avatarUrl; phone = v2.phone;
          joinedAt = v2.joinedAt; isAdmin = v2.isAdmin;
        };
        buf.add((v2.id, u));
      };
      usersById := HashMap.fromIter<UserId, User>(Buffer.toArray(buf).vals(), 16, Nat.equal, natHash);
    } else if (usersStable.size() > 0) {
      // Migrate from V1 (no username)
      let buf = Buffer.Buffer<(UserId, User)>(usersStable.size());
      for ((_, v1) in usersStable.vals()) {
        let u: User = {
          id = v1.id; username = makeAutoUsername(v1.name, v1.id);
          password = v1.pin; name = v1.name; about = v1.about;
          avatarUrl = v1.avatarUrl; phone = v1.phone;
          joinedAt = v1.joinedAt; isAdmin = v1.isAdmin;
        };
        buf.add((v1.id, u));
      };
      usersById := HashMap.fromIter<UserId, User>(Buffer.toArray(buf).vals(), 16, Nat.equal, natHash);
    };
    sessions := HashMap.fromIter<Text, UserId>(sessionsStable.vals(), 16, Text.equal, Text.hash);
    messages := HashMap.fromIter<Nat, Message>(messagesStable.vals(), 64, Nat.equal, natHash);
    otps := HashMap.fromIter<Text, Text>(otpsStable.vals(), 16, Text.equal, Text.hash);
    chatWallpapers := HashMap.fromIter<Text, Text>(wallpapersStable.vals(), 16, Text.equal, Text.hash);
    // Update counters
    for ((uid, _) in usersById.entries()) {
      if (uid >= nextUserId) { nextUserId := uid + 1; };
    };
    for ((mid, _) in messages.entries()) {
      if (mid >= nextMsgId) { nextMsgId := mid + 1; };
    };
    usersStable := [];
    usersStableV2 := [];
    usersStableV3 := [];
    sessionsStable := [];
    messagesStable := [];
    otpsStable := [];
    wallpapersStable := [];
  };

  func makeToken(userId: Nat): Text {
    "tok_" # Nat.toText(userId) # "_" # Nat.toText(Nat32.toNat(Text.hash(Nat.toText(userId))));
  };

  func toPublic(u: User): PublicUser {
    { id = u.id; username = u.username; name = u.name; about = u.about;
      avatarUrl = u.avatarUrl; phone = u.phone; joinedAt = u.joinedAt; isAdmin = u.isAdmin };
  };

  func getUserByToken(token: Text): ?User {
    switch (sessions.get(token)) {
      case null null;
      case (?uid) { usersById.get(uid) };
    };
  };

  func toLower(t: Text): Text {
    Text.map(t, func(c: Char): Char {
      if (c >= 'A' and c <= 'Z') { Char.fromNat32(Char.toNat32(c) + 32) } else c
    });
  };

  func isValidUsername(uname: Text): Bool {
    if (uname.size() < 3 or uname.size() > 20) return false;
    for (c in Text.toIter(uname)) {
      if (not ((c >= 'a' and c <= 'z') or (c >= 'A' and c <= 'Z') or
               (c >= '0' and c <= '9') or c == '_')) {
        return false;
      };
    };
    true;
  };

  func isUsernameAvailableInternal(uname: Text, excludeId: ?UserId): Bool {
    let lower = toLower(uname);
    for ((_, u) in usersById.entries()) {
      if (toLower(u.username) == lower) {
        switch (excludeId) {
          case (?eid) { if (u.id != eid) return false; };
          case null { return false; };
        };
      };
    };
    true;
  };

  func findUserByUsername(uname: Text): ?User {
    let lower = toLower(uname);
    for ((_, u) in usersById.entries()) {
      if (toLower(u.username) == lower) return ?u;
    };
    null;
  };

  // ===== New: Username + Password login =====

  public func registerWithPassword(username: Text, password: Text, name: Text): async RegisterResult {
    if (username == "" or password == "" or name == "") return #err("All fields required");
    if (not isValidUsername(username)) return #err("Username must be 3-20 characters: letters, numbers, underscore only");
    if (password.size() < 4) return #err("Password must be at least 4 characters");
    if (not isUsernameAvailableInternal(username, null)) return #err("Username already taken. Please choose another.");
    let uid = nextUserId;
    nextUserId += 1;
    let user: User = {
      id = uid; username = username; password = password; name = name;
      about = "Hey there! I am using Chat Me";
      avatarUrl = ""; phone = ""; joinedAt = Time.now(); isAdmin = uid == 1;
    };
    usersById.put(uid, user);
    let token = makeToken(uid);
    sessions.put(token, uid);
    #ok({ userId = uid; token = token });
  };

  public func loginWithPassword(username: Text, password: Text): async LoginResult {
    if (username == "" or password == "") return #err("All fields required");
    switch (findUserByUsername(username)) {
      case null { #err("Username not found. Please check or register first.") };
      case (?u) {
        if (u.password != password) return #err("Wrong password. Please try again.");
        let token = makeToken(u.id);
        sessions.put(token, u.id);
        #ok({ token = token; user = toPublic(u) });
      };
    };
  };

  // ===== Username management =====

  public query func isUsernameAvailablePublic(uname: Text): async Bool {
    if (not isValidUsername(uname)) return false;
    isUsernameAvailableInternal(uname, null);
  };

  public query func getUserByUsername(uname: Text): async ?PublicUser {
    Option.map(findUserByUsername(uname), toPublic);
  };

  public func setUsername(token: Text, uname: Text): async { #ok; #err: Text } {
    switch (getUserByToken(token)) {
      case null { #err("Not logged in") };
      case (?u) {
        if (not isValidUsername(uname)) return #err("Username must be 3-20 characters, only letters, numbers, underscore");
        if (not isUsernameAvailableInternal(uname, ?u.id)) return #err("Username already taken");
        let updated: User = {
          id = u.id; username = uname; password = u.password; name = u.name;
          about = u.about; avatarUrl = u.avatarUrl; phone = u.phone;
          joinedAt = u.joinedAt; isAdmin = u.isAdmin;
        };
        usersById.put(u.id, updated);
        #ok;
      };
    };
  };

  // ===== Profile =====

  public func getMyProfile(token: Text): async ?PublicUser {
    Option.map(getUserByToken(token), toPublic);
  };

  public func updateProfile(token: Text, name: Text, about: Text, avatarUrl: Text): async Bool {
    switch (getUserByToken(token)) {
      case null false;
      case (?u) {
        let updated: User = {
          id = u.id; username = u.username; password = u.password;
          name = if (name == "") u.name else name;
          about = if (about == "") u.about else about;
          avatarUrl = if (avatarUrl == "") u.avatarUrl else avatarUrl;
          phone = u.phone; joinedAt = u.joinedAt; isAdmin = u.isAdmin;
        };
        usersById.put(u.id, updated);
        true;
      };
    };
  };

  public func logout(token: Text): async Bool { sessions.delete(token); true; };

  // ===== Messaging =====

  public func sendMessage(token: Text, chatId: Text, text: Text, imageUrl: Text): async ?Nat {
    switch (getUserByToken(token)) {
      case null null;
      case (?u) {
        let msgId = nextMsgId;
        nextMsgId += 1;
        let msg: Message = {
          id = msgId; chatId = chatId; senderId = u.id; senderName = u.name;
          text = text; imageUrl = imageUrl; timestamp = Time.now();
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

  // ===== Chat Wallpapers =====

  public func setChatWallpaper(token: Text, chatId: Text, wallpaper: Text): async Bool {
    switch (getUserByToken(token)) {
      case null false;
      case (?_) { chatWallpapers.put(chatId, wallpaper); true; };
    };
  };

  public query func getChatWallpaper(chatId: Text): async Text {
    switch (chatWallpapers.get(chatId)) {
      case null "";
      case (?w) w;
    };
  };

  // ===== Admin =====

  public func adminGetStats(token: Text): async ?{ userCount: Nat; users: [PublicUser] } {
    switch (getUserByToken(token)) {
      case null null;
      case (?u) {
        if (not u.isAdmin) return null;
        let allUsers = Iter.toArray(Iter.map(usersById.vals(), toPublic));
        ?{ userCount = allUsers.size(); users = allUsers };
      };
    };
  };

  public query func getAllUsers(): async [PublicUser] {
    Iter.toArray(Iter.map(usersById.vals(), toPublic));
  };

  public query func getUserById(userId: UserId): async ?PublicUser {
    Option.map(usersById.get(userId), toPublic);
  };

  public func setApiKey(token: Text, apiKey: Text): async Bool {
    switch (getUserByToken(token)) {
      case null false;
      case (?u) { if (not u.isAdmin) return false; smsApiKey := apiKey; true; };
    };
  };

  public query func isSmsConfigured(): async Bool { smsApiKey != ""; };

  // ===== Legacy phone/OTP functions =====

  func cleanPhone(phone: Text): Text {
    var digits = "";
    for (c in Text.toIter(phone)) {
      if (c >= '0' and c <= '9') { digits := digits # Text.fromChar(c); };
    };
    digits;
  };

  func sendSmsFast2sms(phone: Text, otp: Text): async Bool {
    let cleanNum = cleanPhone(phone);
    let url = "https://www.fast2sms.com/dev/bulkV2?authorization=" # smsApiKey # "&variables_values=" # otp # "&route=otp&numbers=" # cleanNum;
    try {
      Cycles.add<system>(400_000_000_000);
      let response = await ic.http_request({
        url = url;
        max_response_bytes = ?2000;
        headers = [
          { name = "Content-Type"; value = "application/json" },
          { name = "User-Agent"; value = "ChatMe/1.0" }
        ];
        body = null;
        method = #get;
        transform = ?{
          function = transformHttpResponse;
          context = Blob.fromArray([]);
        };
      });
      response.status >= 200 and response.status < 300;
    } catch (_) { false; };
  };

  public func requestOtp(phone: Text): async OtpResult {
    if (phone == "") return #err("Phone number required");
    let timeSlot: Nat = Nat32.toNat(Nat32.fromIntWrap(Time.now() / 1_000_000_000 / 30));
    let seed = Nat32.toNat(Text.hash(phone)) + (timeSlot % 1000000);
    let code = Nat.toText((seed % 900000) + 100000);
    otps.put(phone, code);
    let sent = await sendSmsFast2sms(phone, code);
    if (sent) { #ok(""); } else { #ok(code); };
  };

  public func verifyOtp(phone: Text, otp: Text): async Bool {
    switch (otps.get(phone)) {
      case null false;
      case (?stored) {
        if (stored == otp) { otps.delete(phone); true; } else { false; };
      };
    };
  };

  public query func isPhoneRegistered(phone: Text): async Bool {
    for ((_, u) in usersById.entries()) {
      if (u.phone == phone) return true;
    };
    false;
  };

  public func registerWithOtp(phone: Text, otp: Text, name: Text, pin: Text): async RegisterResult {
    if (phone == "" or otp == "" or name == "" or pin == "") return #err("All fields required");
    switch (otps.get(phone)) {
      case null return #err("OTP expired");
      case (?stored) {
        if (stored != otp) return #err("Invalid OTP");
        otps.delete(phone);
      };
    };
    for ((_, u) in usersById.entries()) {
      if (u.phone == phone) return #err("Phone already registered");
    };
    let uid = nextUserId;
    nextUserId += 1;
    let user: User = {
      id = uid; username = makeAutoUsername(name, uid); password = pin; name = name;
      about = "Hey there! I am using Chat Me";
      avatarUrl = ""; phone = phone; joinedAt = Time.now(); isAdmin = uid == 1;
    };
    usersById.put(uid, user);
    let token = makeToken(uid);
    sessions.put(token, uid);
    #ok({ userId = uid; token = token });
  };

  public func loginWithOtp(phone: Text, otp: Text): async LoginResult {
    if (phone == "" or otp == "") return #err("All fields required");
    switch (otps.get(phone)) {
      case null return #err("OTP expired");
      case (?stored) {
        if (stored != otp) return #err("Invalid OTP");
        otps.delete(phone);
      };
    };
    for ((_, u) in usersById.entries()) {
      if (u.phone == phone) {
        let token = makeToken(u.id);
        sessions.put(token, u.id);
        return #ok({ token = token; user = toPublic(u) });
      };
    };
    #err("Phone not registered");
  };

  public func register(phone: Text, pin: Text, name: Text): async RegisterResult {
    if (phone == "" or pin == "" or name == "") return #err("All fields required");
    for ((_, u) in usersById.entries()) {
      if (u.phone == phone) return #err("Phone already registered");
    };
    let uid = nextUserId;
    nextUserId += 1;
    let user: User = {
      id = uid; username = makeAutoUsername(name, uid); password = pin; name = name;
      about = "Hey there! I am using Chat Me";
      avatarUrl = ""; phone = phone; joinedAt = Time.now(); isAdmin = uid == 1;
    };
    usersById.put(uid, user);
    let token = makeToken(uid);
    sessions.put(token, uid);
    #ok({ userId = uid; token = token });
  };

  public func login(phone: Text, pin: Text): async LoginResult {
    for ((_, u) in usersById.entries()) {
      if (u.phone == phone) {
        if (u.password != pin) return #err("Wrong PIN");
        let token = makeToken(u.id);
        sessions.put(token, u.id);
        return #ok({ token = token; user = toPublic(u) });
      };
    };
    #err("Phone not found");
  };
};

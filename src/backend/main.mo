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

  type ConversationInfo = {
    chatId: Text;
    otherUserId: UserId;
    otherUserName: Text;
    otherUserUsername: Text;
    otherUserAvatar: Text;
    lastMessage: Text;
    lastTimestamp: Int;
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

  var usersStable: [(Text, UserV1)] = [];
  var usersStableV2: [(Text, UserV2)] = [];
  var usersStableV3: [(UserId, User)] = [];

  var sessionsStable: [(Text, UserId)] = [];
  var messagesStable: [(Nat, Message)] = [];
  var otpsStable: [(Text, Text)] = [];
  var wallpapersStable: [(Text, Text)] = [];
  var lastSeenStable: [(UserId, Int)] = [];
  // Friends: userId -> [friendId] (both directions stored)
  var friendsStable: [(UserId, [UserId])] = [];

  func natHash(n: Nat): Nat32 { Nat32.fromNat(n % 4294967295) };

  transient var usersById : HashMap.HashMap<UserId, User> = HashMap.HashMap(16, Nat.equal, natHash);
  transient var sessions : HashMap.HashMap<Text, UserId> = HashMap.HashMap(16, Text.equal, Text.hash);
  transient var messages : HashMap.HashMap<Nat, Message> = HashMap.HashMap(64, Nat.equal, natHash);
  transient var otps : HashMap.HashMap<Text, Text> = HashMap.HashMap(16, Text.equal, Text.hash);
  transient var chatWallpapers : HashMap.HashMap<Text, Text> = HashMap.HashMap(16, Text.equal, Text.hash);
  transient var lastSeen : HashMap.HashMap<UserId, Int> = HashMap.HashMap(16, Nat.equal, natHash);
  // Friends map: userId -> Buffer of friendIds
  transient var friends : HashMap.HashMap<UserId, Buffer.Buffer<UserId>> = HashMap.HashMap(16, Nat.equal, natHash);

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
    lastSeenStable := Iter.toArray(lastSeen.entries());
    // Serialize friends
    let fb = Buffer.Buffer<(UserId, [UserId])>(friends.size());
    for ((uid, buf) in friends.entries()) {
      fb.add((uid, Buffer.toArray(buf)));
    };
    friendsStable := Buffer.toArray(fb);
    usersStable := [];
    usersStableV2 := [];
  };

  system func postupgrade() {
    if (usersStableV3.size() > 0) {
      usersById := HashMap.fromIter<UserId, User>(usersStableV3.vals(), 16, Nat.equal, natHash);
    } else if (usersStableV2.size() > 0) {
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
    lastSeen := HashMap.fromIter<UserId, Int>(lastSeenStable.vals(), 16, Nat.equal, natHash);
    // Restore friends
    for ((uid, arr) in friendsStable.vals()) {
      let buf = Buffer.Buffer<UserId>(arr.size());
      for (fid in arr.vals()) { buf.add(fid); };
      friends.put(uid, buf);
    };
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
    lastSeenStable := [];
    friendsStable := [];
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

  // ===== Online Presence =====

  public func heartbeat(token: Text): async Bool {
    switch (getUserByToken(token)) {
      case null false;
      case (?u) {
        lastSeen.put(u.id, Time.now());
        true;
      };
    };
  };

  public query func isUserOnline(userId: UserId): async Bool {
    let threshold: Int = 30_000_000_000;
    switch (lastSeen.get(userId)) {
      case null false;
      case (?ts) { Time.now() - ts < threshold };
    };
  };

  // ===== Friends =====

  // Add friend: both users get each other added
  public func addFriend(token: Text, friendId: UserId): async { #ok; #err: Text } {
    switch (getUserByToken(token)) {
      case null { #err("Not logged in") };
      case (?me) {
        if (me.id == friendId) return #err("Cannot add yourself");
        // Check friend exists
        switch (usersById.get(friendId)) {
          case null { #err("User not found") };
          case (?_) {
            // Add friendId to my list
            let myBuf = switch (friends.get(me.id)) {
              case null {
                let b = Buffer.Buffer<UserId>(4);
                friends.put(me.id, b);
                b;
              };
              case (?b) { b };
            };
            var alreadyMyFriend = false;
            for (fid in myBuf.vals()) {
              if (fid == friendId) alreadyMyFriend := true;
            };
            if (not alreadyMyFriend) myBuf.add(friendId);

            // Add me to friend's list
            let theirBuf = switch (friends.get(friendId)) {
              case null {
                let b = Buffer.Buffer<UserId>(4);
                friends.put(friendId, b);
                b;
              };
              case (?b) { b };
            };
            var alreadyTheirFriend = false;
            for (fid in theirBuf.vals()) {
              if (fid == me.id) alreadyTheirFriend := true;
            };
            if (not alreadyTheirFriend) theirBuf.add(me.id);

            #ok;
          };
        };
      };
    };
  };

  // Get my friends list
  public func getMyFriends(token: Text): async [PublicUser] {
    switch (getUserByToken(token)) {
      case null { [] };
      case (?me) {
        switch (friends.get(me.id)) {
          case null { [] };
          case (?buf) {
            let result = Buffer.Buffer<PublicUser>(buf.size());
            for (fid in buf.vals()) {
              switch (usersById.get(fid)) {
                case null {};
                case (?u) { result.add(toPublic(u)); };
              };
            };
            Buffer.toArray(result);
          };
        };
      };
    };
  };

  // Check if two users are friends
  public query func areFriends(userId1: UserId, userId2: UserId): async Bool {
    switch (friends.get(userId1)) {
      case null { false };
      case (?buf) {
        var found = false;
        for (fid in buf.vals()) {
          if (fid == userId2) found := true;
        };
        found;
      };
    };
  };

  // ===== Username + Password login =====

  public func registerWithPassword(username: Text, password: Text, name: Text): async RegisterResult {
    let uname = Text.trim(username, #char ' ');
    let pass = Text.trim(password, #char ' ');
    let dname = Text.trim(name, #char ' ');
    if (uname == "" or pass == "" or dname == "") return #err("All fields required");
    if (not isValidUsername(uname)) return #err("Username must be 3-20 characters: letters, numbers, underscore only");
    if (pass.size() < 4) return #err("Password must be at least 4 characters");
    if (not isUsernameAvailableInternal(uname, null)) return #err("Username already taken. Please choose another.");
    let uid = nextUserId;
    nextUserId += 1;
    let user: User = {
      id = uid; username = uname; password = pass; name = dname;
      about = "Hey there! I am using Chat Me";
      avatarUrl = ""; phone = ""; joinedAt = Time.now(); isAdmin = uid == 1;
    };
    usersById.put(uid, user);
    let token = makeToken(uid);
    sessions.put(token, uid);
    lastSeen.put(uid, Time.now());
    #ok({ userId = uid; token = token });
  };

  public func loginWithPassword(username: Text, password: Text): async LoginResult {
    let uname = Text.trim(username, #char ' ');
    let pass = Text.trim(password, #char ' ');
    if (uname == "" or pass == "") return #err("All fields required");
    switch (findUserByUsername(uname)) {
      case null { #err("Username not found. Please check or register first.") };
      case (?u) {
        // Try trimmed password, also try stored password trimmed (for backwards compat)
        let storedTrimmed = Text.trim(u.password, #char ' ');
        if (u.password != pass and storedTrimmed != pass) return #err("Wrong password. Please try again.");
        // Auto-fix stored password if it has spaces
        if (u.password != storedTrimmed) {
          let fixed: User = {
            id = u.id; username = u.username; password = storedTrimmed;
            name = u.name; about = u.about; avatarUrl = u.avatarUrl;
            phone = u.phone; joinedAt = u.joinedAt; isAdmin = u.isAdmin;
          };
          usersById.put(u.id, fixed);
        };
        let token = makeToken(u.id);
        sessions.put(token, u.id);
        lastSeen.put(u.id, Time.now());
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
        lastSeen.put(u.id, Time.now());
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

  // ===== Conversations =====

  func parseNatText(t: Text): ?Nat {
    var result: Nat = 0;
    if (t.size() == 0) return null;
    var valid = true;
    for (c in Text.toIter(t)) {
      if (c >= '0' and c <= '9') {
        result := result * 10 + Nat32.toNat(Char.toNat32(c) - 48);
      } else {
        valid := false;
      };
    };
    if (valid) ?result else null
  };

  func getOtherUserIdFromChatId(chatId: Text, myId: UserId): ?UserId {
    switch (Text.stripStart(chatId, #text "dm_")) {
      case null { null };
      case (?rest) {
        var aStr = "";
        var bStr = "";
        var foundSep = false;
        for (c in Text.toIter(rest)) {
          if (not foundSep) {
            if (c == '_') { foundSep := true; }
            else { aStr := aStr # Text.fromChar(c); };
          } else {
            bStr := bStr # Text.fromChar(c);
          };
        };
        switch (parseNatText(aStr), parseNatText(bStr)) {
          case (?a, ?b) {
            if (a == myId) ?b
            else if (b == myId) ?a
            else null
          };
          case _ { null };
        };
      };
    };
  };

  public func getUserConversations(token: Text): async [ConversationInfo] {
    switch (getUserByToken(token)) {
      case null { [] };
      case (?me) {
        let convMap = HashMap.HashMap<Text, Message>(16, Text.equal, Text.hash);
        for ((_, m) in messages.entries()) {
          let involved: Bool = if (m.senderId == me.id) {
            true
          } else {
            switch (getOtherUserIdFromChatId(m.chatId, me.id)) {
              case null { false };
              case (?_) { true };
            }
          };
          if (involved) {
            switch (convMap.get(m.chatId)) {
              case null { convMap.put(m.chatId, m); };
              case (?existing) {
                if (m.timestamp > existing.timestamp) {
                  convMap.put(m.chatId, m);
                };
              };
            };
          };
        };

        // Also include friends who haven't chatted yet
        switch (friends.get(me.id)) {
          case null {};
          case (?friendBuf) {
            for (fid in friendBuf.vals()) {
              let chatId = "dm_" # Nat.toText(if (me.id < fid) me.id else fid) # "_" # Nat.toText(if (me.id < fid) fid else me.id);
              switch (convMap.get(chatId)) {
                case (?_) {}; // already has messages
                case null {
                  // Add placeholder with 0 timestamp so it shows but at bottom
                  switch (usersById.get(fid)) {
                    case null {};
                    case (?fu) {
                      let placeholder: Message = {
                        id = 0; chatId = chatId; senderId = 0;
                        senderName = ""; text = "Say hello! 👋";
                        imageUrl = ""; timestamp = 0;
                      };
                      convMap.put(chatId, placeholder);
                    };
                  };
                };
              };
            };
          };
        };

        let buf = Buffer.Buffer<ConversationInfo>(convMap.size());
        for ((chatId, lastMsg) in convMap.entries()) {
          switch (getOtherUserIdFromChatId(chatId, me.id)) {
            case null {};
            case (?otherId) {
              switch (usersById.get(otherId)) {
                case null {};
                case (?otherUser) {
                  buf.add({
                    chatId = chatId;
                    otherUserId = otherId;
                    otherUserName = otherUser.name;
                    otherUserUsername = otherUser.username;
                    otherUserAvatar = otherUser.avatarUrl;
                    lastMessage = if (lastMsg.text == "") "Say hello! 👋" else lastMsg.text;
                    lastTimestamp = lastMsg.timestamp;
                  });
                };
              };
            };
          };
        };
        Buffer.toArray(buf)
      };
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

  // Password reset - works for ALL users (not just admin), uses recovery key for verification
  public func resetAdminPassword(targetUsername: Text, newPassword: Text, recoveryKey: Text): async Text {
    if (recoveryKey != "CHATME_ADMIN_RECOVERY_2026") return "Invalid recovery key";
    let trimUser = Text.trim(targetUsername, #char ' ');
    let trimPass = Text.trim(newPassword, #char ' ');
    if (trimPass.size() < 4) return "Password must be at least 4 characters";
    let lower = toLower(trimUser);
    for ((uid, u) in usersById.entries()) {
      if (toLower(u.username) == lower) {
        let updated: User = {
          id = u.id; username = u.username; password = trimPass;
          name = u.name; about = u.about; avatarUrl = u.avatarUrl;
          phone = u.phone; joinedAt = u.joinedAt; isAdmin = u.isAdmin;
        };
        usersById.put(uid, updated);
        return "Password reset successful for " # u.username;
      };
    };
    return "Username not found: " # trimUser;
  };
};

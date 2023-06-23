"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_client_1 = require("socket.io-client");
var httpService_1 = require("./services/httpService");
var httpService = new httpService_1.HttpService();
var conversationName;
var token;
var user;
var socket = (0, socket_io_client_1.io)("http://localhost:3000", {
    transports: ["websocket"],
});
socket.on("message", function (data) {
    if (data.conversation === conversationName) {
        console.log("".concat(data.writer, ": ").concat(data.text));
    }
});
function loginUser(email, password) {
    return __awaiter(this, void 0, void 0, function () {
        var res, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, httpService.post("/login", { email: email, password: password })];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    if (res.status === 200) {
                        token = data.token;
                        user = data.user;
                        askForConversation();
                    }
                    else {
                        console.log(data);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function getChat() {
    return __awaiter(this, void 0, void 0, function () {
        var res, data, conversationMessages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, httpService.get("/conversations/".concat(conversationName), token)];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    if (res.status === 200) {
                        conversationMessages = data.messages;
                        if (conversationMessages.length > 0) {
                            conversationMessages.map(function (m) {
                                return m.writer === user.username
                                    ? console.log("You: ".concat(m.text))
                                    : console.log("".concat(m.writer, ": ").concat(m.text));
                            });
                        }
                        readMessages();
                    }
                    else {
                        console.log(data);
                        res.status === 401 ? authenticateUser() : askForConversation();
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function askForConversation() {
    rl.question("In which conversation you want to join? 1, 2, 3, 4: ", function (conversation) {
        conversationName = conversation;
        getChat();
    });
}
function readMessages() {
    socket.emit("message", {
        writer: user.username,
        text: line,
        conversation: conversationName,
        token: token,
    });
    console.log("You: ".concat(line));
}

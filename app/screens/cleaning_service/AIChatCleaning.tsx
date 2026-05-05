import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  askAIPrivateReg,
  getChatHistoryReq,
  getThreadMessagesReq,
} from "../../api/chat";
import { useAuthStore } from "../../context/useAuthStore";
import { useThemeStore } from "../../context/useThemeStore";
import {
  Container,
  Header,
  Typography,
  Input,
  Avatar,
  Toast,
} from "../../components/index";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

export default function AIChatCleaning({ navigation }: any) {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // --- Chat States ---
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  // --- History Sidebar States ---
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [title, setTitle] = useState<any[]>([]);

  const scrollRef = useRef<ScrollView>(null);

  // --- Toast State ---
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error" | "info";
    visible: boolean;
  }>({ msg: "", type: "success", visible: false });

  const showToast = (
    msg: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await getChatHistoryReq();

      // Karena log lu menunjukkan 'data' langsung berisi 'history' dan 'messages'
      const historyList = res?.data?.history || [];
      const messageList = res?.data?.messages || [];

      setHistory(historyList);
      setTitle(messageList);
    } catch (error: any) {
      console.log("ADUH ERROR BRE:", error.message);
      showToast("Gagal narik riwayat chat", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const startNewChat = () => {
    setMessages([]);
    setThreadId(null);
    setShowHistory(false);
    showToast("Obrolan baru dimulai!", "info");
  };

  const loadOldChat = async (id: string) => {
    setThreadId(id);
    setMessages([]);
    setLoading(true);
    setShowHistory(false);
    try {
      const res = await getThreadMessagesReq(id);
      const oldMessages = res.data.map((m: any) => ({
        role: m.role,
        content: m.content,
      }));
      setMessages(oldMessages);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
    } catch (error) {
      showToast("Gagal muat isi obrolan lama", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setInputText("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await askAIPrivateReg(userMsg, threadId || undefined);

      if (res.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.data.reply },
        ]);
        if (!threadId) fetchHistory();
      }
    } catch (error) {
      showToast("AI Senior lagi pusing!", "error");
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <Container className="bg-background dark:bg-slate-950">
      <Toast message={toast.msg} type={toast.type} visible={toast.visible} />

      <Header
        title={threadId ? "Obrolan Aktif" : "CS Senior AI"}
        showBack={true}
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            onPress={() => {
              setShowHistory(!showHistory);
              fetchHistory();
            }}
            className="p-2 active:opacity-50">
            <MaterialCommunityIcons
              name="menu"
              size={28}
              color={isDark ? "#ffffff" : "#0f172a"}
            />
          </TouchableOpacity>
        }
      />

      <View className="flex-1 flex-row">
        {/* 📚 SIDEBAR HISTORY OVERLAY (FIXED POSITION RIGHT) */}
        {showHistory && (
          <View className="absolute z-50 h-full w-72 right-0 bg-card dark:bg-slate-900 border-l border-border shadow-2xl">
            <ScrollView className="flex-1 p-3">
              <TouchableOpacity
                onPress={startNewChat}
                className="flex-row items-center p-4 mb-4 rounded-2xl border border-dashed border-primary bg-primary/5 active:bg-primary/10">
                <MaterialCommunityIcons
                  name="chat-plus-outline"
                  size={20}
                  color="#0099ff"
                />
                <Typography className="ml-3 text-primary font-black text-xs">
                  Mulai Chat Baru
                </Typography>
              </TouchableOpacity>

              <Typography className="mr-2 mb-3 text-[9px] text-gray-400 font-bold uppercase tracking-widest text-right">
                Riwayat Terakhir
              </Typography>

              {loadingHistory ? (
                <ActivityIndicator color="#0099ff" className="mt-4" />
              ) : history.length === 0 ? (
                <Typography className="text-center text-gray-500 mt-10 text-[10px]">
                  Belum ada riwayat chat.
                </Typography>
              ) : (
                history.map((h, i) => {
                  const firstMsg = title.find((m) => m.threadId === h.threadId);

                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => loadOldChat(h.threadId)}
                      // Style tetep aman gak gw sentuh
                      className={`p-4 mb-2 rounded-2xl flex-row items-center justify-end ${threadId === h.threadId ? "bg-primary/20" : "bg-muted/20 active:bg-muted"}`}>
                      <Typography
                        className={`mr-3 text-xs flex-1 text-right ${threadId === h.threadId ? "text-primary font-bold" : "dark:text-white"}`}
                        numberOfLines={1}>
                        {/* Tampilkan content pesan pertama */}
                        {firstMsg?.content || "Obrolan Baru"}
                      </Typography>
                      <MaterialCommunityIcons
                        name={
                          threadId === h.threadId
                            ? "message-text"
                            : "message-outline"
                        }
                        size={18}
                        color={threadId === h.threadId ? "#0099ff" : "#94a3b8"}
                      />
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <View className="p-5 border-t border-border bg-muted/10">
              <View className="flex-row items-center justify-end">
                <View className="mr-3 flex-1 items-end">
                  <Typography
                    className="dark:text-white font-bold text-xs"
                    numberOfLines={1}>
                    {user?.fullname}
                  </Typography>
                  <Typography className="text-gray-500 text-[9px] uppercase">
                    Petugas CS Senior
                  </Typography>
                </View>
                <Avatar name={user?.fullname || "U"} size="sm" />
              </View>
            </View>
          </View>
        )}

        {/* 💬 CHAT AREA */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 py-2"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }>
          {messages.length === 0 && !loading && (
            <View className="mt-20 items-center justify-center p-10 border-2 border-dashed border-border rounded-[48px]">
              <MaterialCommunityIcons
                name="robot-happy-outline"
                size={72}
                color="#0099ff"
              />
              <Typography
                variant="h2"
                className="mt-6 text-center dark:text-white font-black text-2xl">
                Halo {user?.fullname?.split(" ")[0] || "Bre"}!
              </Typography>
              <Typography className="text-center text-gray-500 mt-2 text-sm leading-6 px-4">
                Ada kendala di area tugas? Langsung tanya AI Senior buat solusi
                cepat dan tepat.
              </Typography>
            </View>
          )}

          {messages.map((msg, index) => (
            <View
              key={index}
              className={`mb-6 flex-row ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <Avatar name="L" size="sm" className="mr-2 self-end mb-1" />
              )}
              <View
                className={`max-w-[82%] p-5 rounded-[30px] ${
                  msg.role === "user"
                    ? "bg-primary rounded-tr-none shadow-lg shadow-primary/20"
                    : "bg-card dark:bg-slate-900 rounded-tl-none border border-border shadow-sm"
                }`}>
                <Typography
                  className={
                    msg.role === "user"
                      ? "text-white font-medium"
                      : "dark:text-white leading-6 text-[13px]"
                  }>
                  {msg.content}
                </Typography>
              </View>
            </View>
          ))}

          {loading && (
            <View className="flex-row justify-start mb-6">
              <Avatar name="AI" size="sm" className="mr-2 self-end" />
              <View className="bg-card dark:bg-slate-900 p-5 rounded-[30px] rounded-tl-none border border-border flex-row items-center shadow-sm">
                <ActivityIndicator color="#0099ff" size="small" />
                <Typography className="ml-3 text-[10px] text-gray-400 font-black italic uppercase tracking-tighter">
                  AI sedang memproses...
                </Typography>
              </View>
            </View>
          )}
          <View className="h-10" />
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
        <View className="p-4 bg-card dark:bg-slate-900 border-t border-border flex-row items-center pb-10 shadow-2xl">
          <View className="flex-1">
            <Input
              placeholder="Tanya AI Senior..."
              value={inputText}
              onChangeText={setInputText}
              className="bg-background dark:bg-slate-950 rounded-2xl border-none"
              onSubmitEditing={handleSend}
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={loading}
            className={`ml-3 p-4 rounded-2xl ${loading ? "bg-gray-400" : "bg-primary shadow-xl shadow-primary/40 active:opacity-80"}`}>
            <MaterialCommunityIcons name="send" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}

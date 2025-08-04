import { useEffect, useState } from "react";
import { X, Send } from "lucide-react";
import characterImg from "@assets/ChatGPT Image 2025년 7월 12일 오후 04_51_30_1752306698190.png";

interface Message {
  id: number;
  sender: "bot" | "user";
  text: string;
}

const HOURS_TEXT = `⏰ 상담 가능시간 안내 (영업일 기준)
평일 AM 9시 ~ PM 6시
점심시간 PM 12시 ~ PM 1시
(주말/공휴일 휴무)`;

function isBusinessHours() {
  const now = new Date();
  const day = now.getDay(); // 0: Sunday, 6: Saturday
  if (day === 0 || day === 6) return false;

  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = 9 * 60;
  const lunchStart = 12 * 60;
  const lunchEnd = 13 * 60;
  const end = 18 * 60;

  return minutes >= start && minutes < end && !(minutes >= lunchStart && minutes < lunchEnd);
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pintoChatOpen") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pintoChatOpen", String(isOpen));
    }
  }, [isOpen]);

  const [showHours, setShowHours] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "안녕하세요. 핀토입니다! 😊\n방문해주셔서 감사합니다 :)",
    },
  ]);

  useEffect(() => {
    if (!isBusinessHours()) {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, sender: "bot", text: "지금은 상담 가능 시간이 아닙니다." },
      ]);
    }
  }, []);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-white shadow-md flex flex-col items-center justify-center text-xs hover:scale-105 transition-transform z-50"
        >
          <img src={characterImg} alt="PINTO" className="w-8 h-8 mb-1" />
          문의하기
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 max-w-[calc(100%-3rem)] bg-white shadow-xl rounded-lg flex flex-col z-50">
          <div className="flex items-start justify-between px-4 py-2 border-b">
            <div>
              <h2 className="font-semibold">핀토</h2>
              <button
                onClick={() => setShowHours((s) => !s)}
                className="text-xs text-blue-600 hover:underline"
              >
                운영시간 보기 {showHours ? "˄" : ">"}
              </button>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="self-start bg-gray-100 text-gray-800 p-2 rounded-lg whitespace-pre-line"
              >
                {msg.text}
              </div>
            ))}
            {showHours && (
              <div className="self-start bg-gray-100 text-gray-800 p-2 rounded-lg whitespace-pre-line">
                {HOURS_TEXT}
              </div>
            )}
          </div>

          <div className="flex items-center border-t p-2">
            <input
              type="text"
              placeholder="메시지를 입력해주세요..."
              disabled
              className="flex-1 px-2 py-1 border rounded-md text-sm mr-2"
            />
            <button disabled className="p-2 text-gray-400">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;

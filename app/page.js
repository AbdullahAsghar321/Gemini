import Image from "next/image";
import Chatbot from "./chatbot/page";

export default function Home() {
  return (
    <div className="grid">
      <Chatbot />
    </div>
  );
}

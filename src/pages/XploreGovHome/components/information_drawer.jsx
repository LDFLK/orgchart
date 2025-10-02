import { BookOpenText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function InformationDrawer({ onClose }) {
  const drawerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsOpen(true), 1);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-6 h-screen flex justify-end">
      <div
        ref={drawerRef}
        className={
          `bg-white/85 rounded-xl p-8 max-w-3xl w-full text-black relative overflow-y-auto h-full shadow-2xl transform transition-transform duration-300 ease-in-out` +
          (isOpen ? ' translate-x-0 opacity-100' : ' translate-x-full opacity-0')
        }
        style={{ maxHeight: "100%" }}
      >
        <div className="flex">
          <BookOpenText className="w-8 h-8 mr-2" />
          <span className="text-2xl">Information Panel</span>
        </div>
        <div className="mt-4">
          <p className="text-black">Put the content here...</p>
        </div>
      </div>
    </div>
  );
}

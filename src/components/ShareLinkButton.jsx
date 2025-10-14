import { useState } from "react";
import { Share2 } from "lucide-react";

const ShareLinkButton = () => {
    const [hovered, setHovered] = useState(false);

    const copyLink = () => {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl)
            .then(() => alert("Link copied to clipboard!"))
            .catch(() => alert("Failed to copy link."));
    };

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "5px",
                transform: "translateY(-50%)",
                zIndex: 9999,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <button
                onClick={copyLink}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px",
                    borderRadius: "8px",
                    //   backgroundColor: hovered ? "#0056b3" : "#007bff",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                }}
            >
                <Share2 size={20} />
                {hovered && (
                    <span
                        style={{
                            marginLeft: "8px",
                            fontSize: "14px",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Share Link
                    </span>
                )}
            </button>
        </div>
    );
};

export default ShareLinkButton;

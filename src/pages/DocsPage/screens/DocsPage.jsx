import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const GITHUB_USERNAME = "sehansi-9";
const REPO_NAME = "orgchart";
const DOCS_BRANCH = "docs";

export default function DocsPage() {
    const [files, setFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const [content, setContent] = useState("");
    const [headings, setHeadings] = useState([]);
    const [currentHash, setCurrentHash] = useState(
        window.location.hash?.replace("#", "") || ""
    );

    const contentRef = useRef(null);
    const pendingFileRef = useRef(null);
    const pendingHashRef = useRef(null);

    // parse URL once on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const fileParam = params.get("file");
        const hash = window.location.hash?.replace("#", "") || null;
        if (fileParam) pendingFileRef.current = fileParam;
        if (hash) pendingHashRef.current = hash;
    }, []);

    // update currentHash state when URL hash changes
    useEffect(() => {
        const handleHashChange = () => setCurrentHash(window.location.hash.replace("#", ""));
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    // fetch docs list
    useEffect(() => {
        async function fetchDocFiles() {
            try {
                const res = await fetch(
                    `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/docs?ref=${DOCS_BRANCH}`
                );
                const data = await res.json();
                const mdFiles = Array.isArray(data)
                    ? data
                        .filter((f) => f.name.endsWith(".md"))
                        .map((f) => ({
                            name: f.name.replace(/-/g, " ").replace(".md", ""),
                            file: f.name,
                            slug: f.name.replace(".md", ""),
                        }))
                    : [];

                setFiles(mdFiles);

                if (pendingFileRef.current) {
                    const matched = mdFiles.find((m) => m.slug === pendingFileRef.current);
                    if (matched) {
                        setActiveFile(matched);
                        return;
                    }
                }

                if (!activeFile && mdFiles.length) setActiveFile(mdFiles[0]);
            } catch (err) {
                console.error("Failed to fetch doc files", err);
            }
        }
        fetchDocFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // helper to make slug
    const slugify = (s) =>
        String(s || "")
            .trim()
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");

    // generate headings
    function generateHeadingIds(md, fileSlug) {
        const extracted = [];
        const idCounts = {};
        const lines = md.split("\n");
        let lastMainHeading = null;

        for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(/^(#{1,3})\s+(.*)/);
            if (!match) continue;
            const level = match[1].length;
            const text = match[2].trim();

            let hasContentAfter = false;
            for (let j = i + 1; j < lines.length; j++) {
                const next = lines[j].trim();
                if (!next) continue;
                if (next.startsWith("#")) break;
                if (next.length > 0) {
                    hasContentAfter = true;
                    break;
                }
            }
            if (!hasContentAfter) continue;

            if (level === 2) lastMainHeading = text;

            let hashSlug = slugify(text);
            if (level === 3 && lastMainHeading) {
                hashSlug = `${slugify(lastMainHeading)}-${hashSlug}`;
            }

            let domId = `${fileSlug}-${hashSlug}`;
            if (idCounts[domId]) {
                idCounts[domId] += 1;
                domId = `${domId}-${idCounts[domId]}`;
            } else {
                idCounts[domId] = 1;
            }

            extracted.push({ level, text, id: domId, hash: hashSlug });
        }

        return extracted;
    }

    // fetch markdown whenever activeFile changes
    useEffect(() => {
        if (!activeFile) return;
        let cancelled = false;

        async function fetchMarkdown(fileName) {
            try {
                const res = await fetch(
                    `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/${DOCS_BRANCH}/docs/${fileName}`
                );
                const md = await res.text();
                if (cancelled) return;
                setContent(md);

                const fileSlug = activeFile.slug || activeFile.file.replace(".md", "");
                const newHeadings = generateHeadingIds(md, fileSlug);
                setHeadings(newHeadings);

                if (contentRef.current)
                    contentRef.current.scrollTo({ top: 0 });

                const pendingHash = pendingHashRef.current;
                const pendingFile = pendingFileRef.current;

                // Update URL with hash if pending, otherwise just file
                const newUrl = (pendingHash && pendingFile === fileSlug)
                    ? `?file=${fileSlug}#${pendingHash}`
                    : `?file=${fileSlug}`;
                window.history.replaceState(null, "", newUrl);

                if (pendingHash && pendingFile === fileSlug) {
                    const targetDomId = `${fileSlug}-${pendingHash}`;
                    setTimeout(() => {
                        const el = document.getElementById(targetDomId);
                        if (el && contentRef.current) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                            setCurrentHash(pendingHash);
                        }
                        pendingHashRef.current = null;
                        pendingFileRef.current = null;
                    }, 300);
                }
            } catch (err) {
                console.error("Failed to fetch markdown", err);
            }
        }

        fetchMarkdown(activeFile.file);

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFile]);

    const getHeadingId = (text, level) => {
        const h = headings.find((h) => h.text === text && h.level === level);
        return h ? h.id : `${activeFile?.slug || activeFile?.file.replace(".md", "")}-${slugify(text)}`;
    };

    const handleHeadingClick = (h) => {
        const el = document.getElementById(h.id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            const fileSlug = activeFile.slug || activeFile.file.replace(".md", "");
            const newUrl = `?file=${fileSlug}#${h.hash}`;
            window.history.replaceState(null, "", newUrl);
            setCurrentHash(h.hash);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-800">
            <nav className="w-90 bg-white border-r border-gray-200 shadow-sm p-4 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">
                    Documentation
                </h2>

                <ul className="space-y-3">
                    {files.map((f) => (
                        <li key={f.file}>
                            <div
                                className={`cursor-pointer px-2 py-1 rounded-md transition-colors duration-200 ${activeFile?.file === f.file ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-700 font-semibold"
                                    }`}
                                onClick={() => {
                                    const fileSlug = f.slug;
                                    if (activeFile?.file === f.file) {
                                        // Same file - scroll to top but keep hash if present
                                        if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
                                        const currentUrl = new URL(window.location.href);
                                        const hash = currentUrl.hash;
                                        window.history.replaceState(null, "", `?file=${fileSlug}${hash}`);
                                    } else {
                                        // Different file - clear hash
                                        window.history.replaceState(null, "", `?file=${fileSlug}`);
                                        setActiveFile(f);
                                    }
                                }}
                            >
                                {"> "}{f.name.replace(/\b\w/g, (c) => c.toUpperCase())}
                            </div>

                            {activeFile?.file === f.file && (
                                <ul className="mt-2 ml-3 border-l border-gray-200 pl-3 space-y-1">
                                    {headings.map((h) => {
                                        const isSelected = currentHash === h.hash;
                                        return (
                                            <li
                                                key={h.id}
                                                className={`p-1 cursor-pointer text-sm transition-colors duration-150 ${h.level === 2 ? "font-medium" : ""
                                                    } ${isSelected ? "text-blue-600" : h.level === 2 ? "text-gray-700" : "text-gray-600"} hover:text-blue-600`}
                                                style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
                                                onClick={() => handleHeadingClick(h)}
                                            >
                                                {h.text}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            <div ref={contentRef} className="flex-1 p-8 overflow-y-auto prose max-w-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        h1: ({ node, ...props }) => {
                            const text = props.children[0]?.toString() || "";
                            const id = getHeadingId(text, 1);
                            return <h1 id={id} className="text-3xl font-bold text-gray-900 border-b border-gray-200 pb-2 mt-10 mb-6" {...props} />;
                        },
                        h2: ({ node, ...props }) => {
                            const text = props.children[0]?.toString() || "";
                            const id = getHeadingId(text, 2);
                            return <h2 id={id} className="text-2xl font-semibold text-gray-800 mt-8 mb-4" {...props} />;
                        },
                        h3: ({ node, ...props }) => {
                            const text = props.children[0]?.toString() || "";
                            const id = getHeadingId(text, 3);
                            return <h3 id={id} className="text-xl font-medium text-gray-700 mt-6 mb-3" {...props} />;
                        },
                        p: ({ node, ...props }) => <p className="mb-5 leading-relaxed text-gray-700" {...props} />,
                        a: ({ node, ...props }) => <a {...props} className="text-blue-600 underline hover:text-blue-800 break-words font-medium" target="_blank" rel="noopener noreferrer" />
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}
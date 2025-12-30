"use client";

import styles from "./ResponseContainer.module.css";
// In a real app, we would use react-markdown here. 
// For now, we will just render text with newlines/paragraphs for simplicity in the prototype.

interface Source {
    title: string;
    url: string;
}

interface ResponseContainerProps {
    content: string;
    sources?: Source[];
    originalQuery?: string;
}

export default function ResponseContainer({ content, sources = [], originalQuery = "" }: ResponseContainerProps) {
    return (
        <div className={styles.container}>
            <div className={styles.response}>
                {content.split('\n').map((line, index) => (
                    // Simple naive parsing for prototype
                    <p key={index}>{line || <br />}</p>
                ))}
            </div>

            {sources.length > 0 && (
                <div className={styles.sources}>
                    <div className={styles.sourcesTitle}>Sources</div>
                    <div className={styles.sourceList}>
                        {sources.map((source, idx) => (
                            <a
                                key={idx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.sourceItem}
                            >
                                {source.title}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {originalQuery && (
                <div className={styles.actions}>
                    <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(originalQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.browserButton}
                    >
                        Open in Browser ↗
                    </a>
                </div>
            )}
        </div>
    );
}

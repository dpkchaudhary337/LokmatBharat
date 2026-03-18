"use client";

import React, { Fragment, useEffect, useRef, useState } from "react";
import MarqueeNews from "./MarqueeNews";

interface MarqueeNewsItem {
  Slug: string;
  TitleData: Array<{
    Translation: string;
  }>;
}

interface TopHeaderScrollProps {
  marqueeNews?: MarqueeNewsItem[];
  site_lang?: number | string;
}

export default function TopHeaderScroll({ marqueeNews, site_lang }: TopHeaderScrollProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ Prevent SSR mismatch
  if (!isMounted) return null;

  // Normalize site_lang to number for comparison
  const siteLangNum = typeof site_lang === 'string' ? parseInt(site_lang) : (site_lang || 3);

  return (
    <Fragment>
      <section className="top-header">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="content">
                <div className="left-content">
                  <div className="heading">
                    <span>{siteLangNum === 3 ? "अभी का दौर" : "Breaking News"} </span>
                  </div>
                  <span className="arrowRight"></span>

                  <div
                    ref={marqueeRef}
                    className="marquee-container"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    style={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      flex: 1,
                      position: "relative",
                    }}
                  >
                    <div
                      ref={contentRef}
                      className={`marquee-content ${isPaused ? 'marquee-paused' : ''}`}
                      style={{
                        display: "inline-block",
                        whiteSpace: "nowrap",
                        willChange: "transform",
                      }}
                    >
                      {marqueeNews && marqueeNews.length > 0 ? (
                        <>
                          {marqueeNews.map((news: MarqueeNewsItem, i: number) => (
                            <MarqueeNews key={`first-${i}`} news={news} />
                          ))}
                          {marqueeNews.map((news: MarqueeNewsItem, i: number) => (
                            <MarqueeNews key={`second-${i}`} news={news} />
                          ))}
                        </>
                      ) : (
                        <span>Loading news...</span>
                      )}
                    </div>
                  </div>

                  <style jsx global>{`
                    @keyframes marquee-scroll {
                      0% {
                        transform: translateX(0);
                      }
                      100% {
                        transform: translateX(-50%);
                      }
                    }
                    .marquee-content {
                      animation: marquee-scroll 60s linear infinite;
                    }
                    .marquee-content.marquee-paused {
                      -webkit-animation-play-state: paused;
                      -moz-animation-play-state: paused;
                      -o-animation-play-state: paused;
                      animation-play-state: paused;
                    }
                  `}</style>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

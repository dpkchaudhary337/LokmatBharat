"use client";

import React, { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import configData from "@/components/Config";
import LazyImage from "./LazyImage";

interface Language {
  ID: number;
  Name: string;
}

interface SettingData {
  FacebookLink: string;
  TwitterLink: string;
  InstagramLink: string;
  YoutubeLink: string;
  LogoLiveUrl: string;
  FooterLogoLiveUrl: string;
  YoutubeVideoURL: string;
  MetaTags: string;
  GoogleAnalytics: string;
  Address: string;
  MailID: string;
  Mobile1: string;
  Mobile2: string;
  Copyright: string;
}

export default function TopHeader({ todayDate = "" }: { todayDate?: string }) {

  const [settingData, setSettingData] = useState<SettingData>({
    FacebookLink: "",
    TwitterLink: "",
    InstagramLink: "",
    YoutubeLink: "",
    LogoLiveUrl: "",
    FooterLogoLiveUrl: "",
    YoutubeVideoURL: "",
    MetaTags: "",
    GoogleAnalytics: "",
    Address: "",
    MailID: "",
    Mobile1: "",
    Mobile2: "",
    Copyright: "",
  });

  const [languages, setLanguages] = useState<Language[]>([]);
  const [lang, setLang] = useState<string>("3");

  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("site_lang") || "3";
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, langRes] = await Promise.all([
          axios.get(configData.SETTING_URL, axiosConfig),
          axios.get(configData.GET_LANGUAGES, axiosConfig),
        ]);

        const settingsPayload = JSON.parse(settingsRes.data.payload)[0];
        const langPayload = JSON.parse(langRes.data.payload);

        setSettingData(settingsPayload);
        setLanguages(langPayload);
      } catch (err) {
        console.error("TopHeader API error:", err);
      }
    };

    fetchData();
  }, []);

  const handleLangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    setLang(newLang);

    if (typeof window !== "undefined") {
      localStorage.setItem("site_lang", newLang);
      window.location.reload();
    }
  };

  // Remove day name (e.g., "Wednesday,") from date string for mobile view
  const formatDateForMobile = (dateStr: string): string => {
    if (!dateStr) return "";
    // Remove day name and comma (e.g., "Wednesday, " or "Wednesday,")
    return dateStr.replace(/^[A-Za-z]+,\s*/, "");
  };

  return (
    <>
      <Fragment>
        <section className="main-top-header">
          <div className="container">
            <div className="row align-self-center">
              <div className="top-header-content d-flex flex-wrap justify-content-between align-items-center w-100">

                {/* Logo */}
                <div className="col-xl-2 col-lg-3 col-md-3 col-sm-6 col-xs-12 hideMobile">
                  <div className="navbar-logo">
                    <Link className="navbar-brand" href="/">
                      {settingData.LogoLiveUrl ? (
                        <LazyImage
                          src={settingData.LogoLiveUrl}
                          alt="Lokmat Bharat"
                        />
                      ) : (
                        <span>Lokmat Bharat</span>
                      )}
                    </Link>
                  </div>
                </div>

                {/* Date + Lang + Social - Combined for mobile */}
                <div className="col-xl-10 col-lg-9 col-md-9 col-sm-12 col-xs-12">
                  <div className="left-content mobile-header-single-line">
                    <ul className="list d-flex align-items-center justify-content-between w-100">
                      {/* Language - Left */}
                      <li className="">
                        <i className="fa fa-globe text-white"></i>
                        <select id="languageChange" value={lang} onChange={handleLangChange}>
                          {languages.map((l) => (
                            <option key={l.ID} value={l.ID}>
                              {l.Name}
                            </option>
                          ))}
                        </select>
                      </li>
                      
                      {/* Date - Center */}
                      <li className="mobile-date-center">
                        <a>
                          <i className="fa fa-calendar-alt"></i>&nbsp;
                          {/* Desktop: Full date */}
                          <span className="d-none d-md-inline">
                            {todayDate || "Today"}
                          </span>
                          {/* Mobile: Date without day name */}
                          <span className="d-inline d-md-none">
                            {todayDate ? formatDateForMobile(todayDate) : "Today"}
                          </span>
                        </a>
                      </li>

                      {/* Social Icons - Right */}
                      <li className="d-flex align-items-center mobile-social-right">
                        {[
                          { href: settingData.FacebookLink, icon: "facebook-f" },
                          { href: settingData.TwitterLink, icon: "twitter" },
                          { href: settingData.InstagramLink, icon: "instagram" },
                          { href: settingData.YoutubeLink, icon: "youtube" },
                        ].map((link, idx) =>
                          link.href ? (
                            <a
                              key={idx}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ marginLeft: "8px" }}
                            >
                              <i className={`fab fa-${link.icon}`}></i>
                            </a>
                          ) : null
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Fragment>
    </>
  );
}

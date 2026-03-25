"use client";

import React, { useEffect, useState } from "react";
import configData from "@/components/Config";
import { cachedAxiosGet } from "@/utils/apiCache";
import Home from "@/components/Home";
import { useMetadata } from "@/utils/useMetadata";

export default function HomePage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [marqueeNews, setMarqueeNews] = useState<any[]>([]);
  const [adHeader, setAdHeader] = useState<any>();
  const [adFooter, setAdFooter] = useState<any>();
  const [adRight, setAdRight] = useState<any>();
  const [adRight2, setAdRight2] = useState<any>();
  const [adRight3, setAdRight3] = useState<any>();
  const [homeSlider, setHomeSlider] = useState<any[]>([]);
  const [footerMenu, setFooterMenu] = useState<any[]>([]);
  const [homeRightSlider, setHomeRightSlider] = useState<any[]>([]);
  const [settingData, setSettingData] = useState<any>({
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

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const todayDate = `${new Date().getDate()} ${
    monthNames[new Date().getMonth()]
  } ${new Date().getFullYear()}`;
  const site_lang =
    typeof window !== "undefined" && localStorage.getItem("site_lang")
      ? localStorage.getItem("site_lang")
      : 3;

  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          menuRes,
          marqueeRes,
          adHeaderRes,
          adFooterRes,
          adRightRes,
          adRight2Res,
          adRight3Res,
          homeSliderRes,
          homeRightSliderRes,
          footerMenuRes,
          settingRes,
        ] = await Promise.all([
          cachedAxiosGet(configData.MENU_API_URL, axiosConfig),
          cachedAxiosGet(configData.MARQUEE_API_URL, axiosConfig),
          cachedAxiosGet(configData.AD_API_URL + "home-header1", axiosConfig),
          cachedAxiosGet(configData.AD_API_URL + "home-footer1", axiosConfig),
          cachedAxiosGet(configData.AD_API_URL + "home-right1", axiosConfig),
          cachedAxiosGet(configData.AD_API_URL + "home-right2", axiosConfig),
          cachedAxiosGet(configData.AD_API_URL + "home-right3", axiosConfig),
          cachedAxiosGet(configData.HOME_SLIDER_API_URL, axiosConfig),
          cachedAxiosGet(configData.HOME_Right_SLIDER_API_URL, axiosConfig),
          cachedAxiosGet(configData.FOOTER_MENU_API_URL, axiosConfig),
          cachedAxiosGet(configData.SETTING_URL, axiosConfig),
        ]);

        // Extract actual data from cached results
        const extractData = (result: any) => {
          if (result?._data !== undefined) return result._data;
          return result;
        };
        
        setMenus(extractData(menuRes) || []);
        setMarqueeNews(extractData(marqueeRes) || []);
        setAdHeader(extractData(adHeaderRes));
        setAdFooter(extractData(adFooterRes));
        setAdRight(extractData(adRightRes));
        setAdRight2(extractData(adRight2Res));
        setAdRight3(extractData(adRight3Res));
        setHomeSlider(extractData(homeSliderRes) || []);
        setHomeRightSlider(extractData(homeRightSliderRes) || []);
        setFooterMenu(extractData(footerMenuRes) || []);
        const settingDataValue = extractData(settingRes);
        setSettingData(Array.isArray(settingDataValue) ? settingDataValue[0] : settingDataValue);
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    fetchData();
  }, []);

  // Normalize keywords from settings and replace any old branding
  const rawMetaTags = settingData?.MetaTags;
  const normalizedKeywords =
    typeof rawMetaTags === "string" && rawMetaTags.trim().length > 0
      ? rawMetaTags.replace(/Navtej TV/gi, "Lokmat Bharat")
      : "Lokmat Bharat, Hindi News, News, Latest Updates";

  // Set dynamic metadata
  useMetadata({
    title: "Hindi News; Latest Hindi News, Breaking Hindi News Live, Hindi Samachar (हिंदी समाचार), Hindi News Paper Today - Lokmat Bharat",
    description: "Lokmat Bharat Hindi News Samachar - Find all Hindi News and Samachar, News in Hindi, Hindi News Headlines and Daily Breaking Hindi News Today and Updated From lokmatbharat.com",
    keywords: normalizedKeywords,
    url: "https://lokmatbharat.com/",
    image: "https://lokmatbharat.com/assets/images/social.jpg",
  });

  return (
    <>
      <head>
        <link rel="amphtml" href="https://lokmatbharat.com/amp" />
      </head>
      <Home
        homeRightSlider={homeRightSlider}
        menus={menus}
        marqueeNews={marqueeNews}
        site_lang={site_lang}
        adHeader={adHeader}
        adRight={adRight}
        adRight2={adRight2}
        adRight3={adRight3}
        adFooter={adFooter}
        homeSlider={homeSlider}
        todayDate={todayDate}
        footerMenu={footerMenu}
        settingData={settingData}
      />
    </>
  );
}
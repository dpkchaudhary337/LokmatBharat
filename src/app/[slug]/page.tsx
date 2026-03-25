"use client";

import React, { useEffect, useState, use } from "react";
import configData from "@/components/Config";
import { cachedAxiosGet } from "@/utils/apiCache";
import About from "@/components/About";
import Advertise from "@/components/Advertise";
import Support from "@/components/Support";
import Features from "@/components/Features";
import ContactUs from "@/components/Contact/ContactUs";
import Privacy_Policy from "@/components/Privacy_Policy";
import { useMetadata } from "@/utils/useMetadata";
import Axios from "axios";

const customPageComponents: { [key: string]: React.ComponentType<any> } = {
  about: About,
  advertise: Advertise,
  support: Support,
  features: Features,
  contact: ContactUs,
  "privacy-policy": Privacy_Policy,
  "privacy_policy": Privacy_Policy,
};

export default function CustomPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = use(params);

  const [menus, setMenus] = useState<any[]>([]);
  const [marqueeNews, setMarqueeNews] = useState<any[]>([]);
  const [adHeader, setAdHeader] = useState<any>();
  const [adFooter, setAdFooter] = useState<any>();
  const [adRight, setAdRight] = useState<any>();
  const [footerMenu, setFooterMenu] = useState<any[]>([]);
  const [settingData, setSettingData] = useState<any>({});
  const [customPageData, setCustomPageData] = useState<any>(null);

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
          footerMenuRes,
          settingRes,
        ] = await Promise.all([
          cachedAxiosGet(configData.MENU_API_URL, axiosConfig),
          cachedAxiosGet(configData.MARQUEE_API_URL, axiosConfig),
          cachedAxiosGet(configData.AD_API_URL + "home-header1", axiosConfig),
          cachedAxiosGet(configData.AD_API_URL + "home-footer1", axiosConfig),
          cachedAxiosGet(configData.AD_API_URL + "home-right1", axiosConfig),
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
        setFooterMenu(extractData(footerMenuRes) || []);
        const settingDataValue = extractData(settingRes);
        setSettingData(Array.isArray(settingDataValue) ? settingDataValue[0] : settingDataValue);
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch custom page data for metadata
  useEffect(() => {
    const fetchCustomPage = async () => {
      try {
        const customPageURL = configData.GET_CUSTOM_PAGE + slug;
        const response = await Axios.get(customPageURL, {
          headers: { sessionToken: configData.SESSION_TOKEN },
        });
        const data = JSON.parse(response.data.payload);
        setCustomPageData(Array.isArray(data) ? data[0] : data);
      } catch (error) {
        console.error("Error fetching custom page:", error);
      }
    };
    fetchCustomPage();
  }, [slug]);

  // Set dynamic metadata
  const pageTitle = customPageData?.TitleData?.[0]?.Translation || `${slug.replace(/-/g, " ")} | Lokmat Bharat`;
  const pageDescription = customPageData?.DescriptionData?.[0]?.Translation 
    ? customPageData.DescriptionData[0].Translation.substring(0, 160).replace(/<[^>]*>/g, "")
    : `Read about ${slug.replace(/-/g, " ")} on Lokmat Bharat`;
  const pageUrl = `https://lokmatbharat.com/${slug}`;
  
  useMetadata({
    title: `${pageTitle} | Lokmat Bharat`,
    description: pageDescription,
    keywords: slug,
    url: pageUrl,
  });

  const CustomPageComponent = customPageComponents[slug.toLowerCase()];

  if (!CustomPageComponent) {
    return <div>Page not found</div>;
  }

  return (
    <CustomPageComponent
      slug={slug}
      menus={menus}
      marqueeNews={marqueeNews}
      site_lang={site_lang}
      todayDate={todayDate}
      adHeader={adHeader}
      adFooter={adFooter}
      adRight={adRight}
      footerMenu={footerMenu}
      settingData={settingData}
    />
  );
}


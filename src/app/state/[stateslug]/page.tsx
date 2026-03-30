"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import configData from "@/components/Config";
import { cachedAxiosGet } from "@/utils/apiCache";
import State from "@/components/state/State";
import { useMetadata } from "@/utils/useMetadata";
import Axios from "axios";

function StatePageContent({ 
  params 
}: { 
  params: Promise<{ stateslug: string }> 
}) {
  const resolvedParams = use(params);
  const stateslug = resolvedParams?.stateslug || "";

  if (!stateslug) {
    return <div>Loading state...</div>;
  }

  const [menus, setMenus] = useState<any[]>([]);
  const [marqueeNews, setMarqueeNews] = useState<any[]>([]);
  const [adHeader, setAdHeader] = useState<any>();
  const [adFooter, setAdFooter] = useState<any>();
  const [adRight, setAdRight] = useState<any>();
  const [footerMenu, setFooterMenu] = useState<any[]>([]);
  const [settingData, setSettingData] = useState<any>({});

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

  // Fetch state data for metadata
  const [stateData, setStateData] = useState<any>(null);
  
  useEffect(() => {
    const fetchStateData = async () => {
      try {
        const stateUrl = configData.POST_API_URL.replace("#CATEGORY_SLUG", stateslug).replace("#OFFSET", "0");
        const response = await Axios.get(stateUrl, axiosConfig);
        const data = JSON.parse(response.data.payload);
        setStateData(Array.isArray(data) ? data[0] : data);
      } catch (error) {
        console.error("Error fetching state data:", error);
      }
    };
    fetchStateData();
  }, [stateslug]);

  // Set dynamic metadata
  const stateName = stateData?.CategoryName || (stateslug ? stateslug.replace(/-/g, " ") : "State");
  const stateUrl = stateslug ? `https://lokmatbharat.com/state/${stateslug}` : "";
  
  useMetadata({
    title: `${stateName} News | Lokmat Bharat`,
    description: `Latest ${stateName} news and updates on Lokmat Bharat`,
    keywords: `${stateName}, News`,
    url: stateUrl,
  });

  return (
    <State
      stateslug={stateslug}
      menus={menus || []}
      marqueeNews={marqueeNews || []}
      site_lang={site_lang}
      todayDate={todayDate}
      adHeader={adHeader}
      adFooter={adFooter}
      adRight={adRight}
      footerMenu={footerMenu || []}
      settingData={settingData || {}}
    />
  );
}

export default function StatePage({ 
  params 
}: { 
  params: Promise<{ stateslug: string }> 
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StatePageContent params={params} />
    </Suspense>
  );
}


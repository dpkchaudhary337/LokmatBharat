"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cachedAxiosGet } from "@/utils/apiCache";
import configData from "@/components/Config";
import MainMenuCategory from "./MainMenuCategory";
import LazyImage from "./LazyImage";

export default function ({
  menus = [],
  settingData = {},
  site_lang = 3,
}: {
  menus?: any[];
  settingData?: any;
  site_lang?: number;
}) {
  const [searchField, setSearchField] = useState(false);
  const [SettingData, setSettingData] = useState({
    LogoLiveUrl: "",
  });

  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await cachedAxiosGet(configData.SETTING_URL, axiosConfig);
        const data = result?._data ?? result;
        setSettingData(Array.isArray(data) ? data[0] : data || {});
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  // Close dropdown menu when clicking outside dropdown
  useEffect(() => {
    const handleClickAnywhere = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't close if clicking inside dropdown menu or on toggle button
      const isInsideDropdown = target.closest('.mega-menu .dropdown-menu');
      const isDropdownToggle = target.closest('.nav-link.dropdown-toggle');
      
      if (isInsideDropdown || isDropdownToggle) {
        return;
      }
      
      // Close all dropdown menus when clicking outside
      const dropdownMenus = document.querySelectorAll('.mega-menu .dropdown-menu');
      dropdownMenus.forEach((menu: any) => {
        menu.style.display = 'none';
      });
    };

    // Add event listener to document
    document.addEventListener('click', handleClickAnywhere);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClickAnywhere);
    };
  }, []);

  return (
    <div className="mainmenu-area">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            
            {/* Top Mobile Menu */}
            <div className="navsm" style={{ alignItems: "center" }}>
              <div className="toogle-icon">
                <i className="fas fa-bars"></i>
              </div>

              <Link className="navbar-brand" href="/">
                <LazyImage
                  src={SettingData?.LogoLiveUrl || "/logo.png"}
                  alt="Logo"
                />
              </Link>

              <div
                className="serch-icon-area"
                onClick={() => setSearchField(!searchField)}
              >
                <p className="web-serch">
                  <i className="fas fa-search"></i>
                </p>
              </div>

              {searchField && (
                <div className="search-form-area">
                  <form className="search-form" action="/news-search/" method="get">
                    <input
                      type="text"
                      name="search"
                      placeholder={
                        site_lang == 3
                          ? "आप जो चाहते हैं उसे खोजें"
                          : "Search what you want"
                      }
                    />
                  </form>
                </div>
              )}
            </div>

            {/* Desktop Menu */}
            <nav className="navbar navbar-expand-lg navbar-light menulg">
              <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#main_menu"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse fixed-height" id="main_menu">
                <ul className="navbar-nav mr-auto">
                  {menus?.map((menu, index) => (
                    <MainMenuCategory
                      key={index}
                      categorySlug={menu.Slug}
                      categoryId={menu.ID}
                      GotoStatePage={menu.GotoStatePage}
                      categoryName={menu.MenuTitle}
                      isChild={menu.childs?.length > 0}
                      childMenu={menu.childs || []}
                    />
                  ))}
                </ul>

                <div className="d-none d-lg-flex align-items-center">
                  <div
                    className="serch-icon-area"
                    onClick={() => setSearchField(!searchField)}
                    style={{ cursor: "pointer" }}
                  >
                    <p className="web-serch mb-0">
                      <i className="fas fa-search"></i>
                    </p>
                  </div>

                  {searchField && (
                    <div className="search-form-area ml-3">
                      <form
                        className="search-form d-flex"
                        action="/news-search/"
                        method="get"
                      >
                        <input
                          type="text"
                          name="search"
                          style={{
                            backgroundColor: "#fff",
                            color: "#111",
                          }}
                          placeholder={
                            site_lang == 3
                              ? "आप जो चाहते हैं उसे खोजें"
                              : "Search what you want"
                          }
                        />
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </nav>

          </div>
        </div>
      </div>
    </div>
  );
}

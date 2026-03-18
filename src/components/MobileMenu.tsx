"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import MainMenuCategory from "./MainMenuCategory";
import LazyImage from "./LazyImage";
import { cachedAxiosGet } from "@/utils/apiCache";
import configData from "./Config";

interface MobileMenuProps {
  menus: any[];
  settingData?: any;
}

export default function MobileMenu({ menus, settingData }: MobileMenuProps) {
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

  // Function to close mobile menu
  const closeMobileMenu = () => {
    const mobileMenu = document.querySelector('.mobile-menu') as HTMLElement;
    if (mobileMenu) {
      mobileMenu.style.left = '-100%';
      mobileMenu.style.opacity = '0';
    }
  };

  // Close mobile menu when any link is clicked
  useEffect(() => {
    // Add click event listener to all links inside mobile menu
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');
    
    mobileMenuLinks.forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Cleanup
    return () => {
      mobileMenuLinks.forEach((link) => {
        link.removeEventListener('click', closeMobileMenu);
      });
    };
  }, [menus]); // Re-run when menus change

  return (
    <div className="mobile-menu">
      <div className="logo-area">
        <Link href="/" className="navbar-brand">
          <LazyImage
            src={SettingData?.LogoLiveUrl || "/logo.png"}
            alt="Logo"
          />
        </Link>
        <div className="close-menu" onClick={closeMobileMenu}>
          <i className="fas fa-times"></i>
        </div>
      </div>

      <ul className="mobile-menu-list">
        {menus?.map((menu) => (
          <MainMenuCategory
            key={menu.ID}
            categorySlug={menu.Slug}
            categoryId={menu.ID}
            GotoStatePage={menu.GotoStatePage}
            categoryName={menu.MenuTitle}
            isChild={menu.childs?.length > 0}
            childMenu={menu.childs || []}
          />
        ))}
      </ul>
    </div>
  );
}

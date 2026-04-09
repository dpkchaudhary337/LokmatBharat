"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import configData from "./Config";

export default function MainMenuSubCategory(props: any) {
  function showMenuTab(
    tabId: string,
    anchorEl: HTMLElement | null
  ) {
    const megaRoot = anchorEl?.closest(".mega-menu") ?? undefined;
    const element = document.getElementById(tabId);

    const tabPanels = megaRoot
      ? megaRoot.querySelectorAll(".go-tab-c")
      : document.querySelectorAll(".go-tab-c");
    tabPanels.forEach((node) => node.classList.remove("active"));

    if (element) {
      element.classList.add("active");
    }

    const tabLinks = megaRoot
      ? megaRoot.querySelectorAll(".nav.flex-column .nav-link.tab-link")
      : document.querySelectorAll(
          ".mega-menu .nav.flex-column .nav-link.tab-link"
        );
    tabLinks.forEach((link) => {
      const el = link as HTMLElement;
      if (el.dataset.menuTab === tabId) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }

  function closeDropdownMenu() {
    // Close all dropdown menus
    const dropdownMenus = document.querySelectorAll('.mega-menu .dropdown-menu');
    dropdownMenus.forEach((menu: any) => {
      menu.style.display = 'none';
    });
  }
  
  const href = props.GotoStatePage 
    ? `/state/${props.categorySlug}` 
    : `${configData.BASE_URL_CATEGORY}${props.categorySlug}`;
  
  const linkActive = props.isDefaultActive ? " active" : "";

  return (
    <Link 
      className={`nav-link tab-link${linkActive}`}
      data-menu-tab={props.dataTab}
      onMouseOver={(e) => {
        showMenuTab(props.dataTab, e.currentTarget);
      }}
      href={href}
      data-tab={`#${props.dataTab}`}
      onClick={(e) => {
        // Prevent page refresh, allow Next.js Link to handle navigation
        e.stopPropagation();
        // Close dropdown menu when link is clicked
        closeDropdownMenu();
      }}
    >
      {props.categoryName}
    </Link>
  );
}

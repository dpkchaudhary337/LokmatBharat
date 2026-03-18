"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import configData from "./Config";

export default function MainMenuSubCategory(props: any) {
  function showMenuTab(e: string) {
    const element = document.getElementById(e);
    // const allElements = document.getElementsByClassName('go-tab-c');
    const nodeList = document.querySelectorAll(".go-tab-c");
    for (let i = 0; i < nodeList.length; i++) {
      nodeList[i].classList.remove('active');
    }

    if (element) {
      element.classList.add("active");
    }
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
  
  return (
    <Link 
      className="nav-link tab-link" 
      onMouseOver={() => { showMenuTab(props.dataTab) }}  
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

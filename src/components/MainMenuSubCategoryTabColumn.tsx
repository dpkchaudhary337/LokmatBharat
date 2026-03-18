"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import configData from "./Config";
import LazyImage from "./LazyImage";

export default function MainMenuSubCategoryTabColumn(props: any) {
  const detailUrl = `${configData.BASE_URL_CATEGORY_DETAIL}${props.slug}`;
  
  function closeDropdownMenu() {
    // Close all dropdown menus
    const dropdownMenus = document.querySelectorAll('.mega-menu .dropdown-menu');
    dropdownMenus.forEach((menu: any) => {
      menu.style.display = 'none';
    });
  }
  
  return (
      <div className="col-lg-3 col-md-4 col-sm-6 pr-0">
        <div className="single-news-menu">
          <Link 
            href={detailUrl}
            onClick={(e) => {
              // Close dropdown menu when link is clicked
              closeDropdownMenu();
            }}
          >
            <div className="content-wrapper">
              <div className="img">
                <div className="tag" style={{backgroundColor: props.CategoryColor}}>{props.categoryName}</div>
                <LazyImage
                  src={props.imageUrl}
                  alt={props.title || "menu-image"}
                />
              </div>
              <div className="inner-content">
                <h4 className="title">
                  {props.title}
                </h4>
                
              </div>
            </div>
          </Link>
        </div>
      </div>
  )
}

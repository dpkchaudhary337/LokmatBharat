"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import MainMenuSubCategory from "./MainMenuSubCategory";
import MainMenuSubCategoryTab from "./MainMenuSubCategoryTab";
import configData from "./Config";

function CategoryWithoutChild({
  categorySlug,
  categoryName,
  GotoStatePage
}: any) {
  const href = GotoStatePage
    ? `/state/${categorySlug}`
    : `${configData.BASE_URL_CATEGORY}${categorySlug}`;

  return (
    <Fragment>
      <li className="nav-item">
        <Link 
          href={href} 
          className="nav-link active"
          onClick={(e) => {
            // Prevent page refresh, allow Next.js Link to handle navigation
            e.stopPropagation();
          }}
        >
          {categoryName}
        </Link>
      </li>
    </Fragment>
  );
}

function CategoryWithChild({
  categorySlug,
  categoryName,
  childMenu,
  GotoStatePage
}: any) {
  const href = GotoStatePage
    ? `/state/${categorySlug}`
    : `${configData.BASE_URL_CATEGORY}${categorySlug}`;

  return (
    <Fragment>
      <li className="nav-item dropdown mega-menu">
        <Link 
          href={href} 
          className="nav-link dropdown-toggle"
          onClick={(e) => {
            // Prevent default navigation when clicking dropdown toggle
            e.preventDefault();
            e.stopPropagation();
            
            // Close all other dropdown menus first
            const allDropdowns = document.querySelectorAll('.mega-menu .dropdown-menu');
            allDropdowns.forEach((menu: any) => {
              menu.style.display = 'none';
            });
            
            // Toggle only the clicked dropdown menu
            const dropdownMenu = e.currentTarget.closest('.mega-menu')?.querySelector('.dropdown-menu') as HTMLElement;
            if (dropdownMenu) {
              const isVisible = dropdownMenu.style.display === 'block' || window.getComputedStyle(dropdownMenu).display === 'block';
              dropdownMenu.style.display = isVisible ? 'none' : 'block';
            }
          }}
        >
          {categoryName}
        </Link>

        <div className="dropdown-menu">
          <div className="row m-0 p-0">
            <div className="col-lg-2 p-0">
              <div className="nav flex-column">
                {childMenu.map((cMenu: any) => (
                  <MainMenuSubCategory
                    key={cMenu.ID}
                    categoryUrl={`${configData.BASE_URL_CATEGORY}${cMenu.ID}/${cMenu.MenuTitle}`}
                    categoryName={cMenu.MenuTitle}
                    dataTab={`${cMenu.ID}`}
                    categorySlug={cMenu.Slug}
                    GotoStatePage={cMenu.GotoStatePage}
                  />
                ))}
              </div>
            </div>

            <div className="col-lg-10">
              <div className="tab-content">
                {childMenu.map((cMenu: any, i: number) => (
                  <MainMenuSubCategoryTab
                    key={cMenu.ID}
                    index={i}
                    id={cMenu.ID}
                    categoryName={cMenu.MenuTitle}
                    categorySlug={cMenu.Slug}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </li>
    </Fragment>
  );
}

export default function MainMenuCategory({
  isChild,
  categoryId,
  categoryName,
  categorySlug,
  childMenu,
  GotoStatePage
}: any) {
  if (isChild) {
    return (
      <CategoryWithChild
        categoryId={categoryId}
        categoryName={categoryName}
        categorySlug={categorySlug}
        childMenu={childMenu}
        GotoStatePage={GotoStatePage}
      />
    );
  } else {
    return (
      <CategoryWithoutChild
        categoryId={categoryId}
        categoryName={categoryName}
        categorySlug={categorySlug}
        GotoStatePage={GotoStatePage}
      />
    );
  }
}

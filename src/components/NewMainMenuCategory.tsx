"use client";

import React, { Fragment, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MainMenuSubCategory from "./MainMenuSubCategory";
import MainMenuSubCategoryTab from "./MainMenuSubCategoryTab";
import configData from "./Config";

function CategoryWithoutChild({
  categorySlug,
  categoryName,
  GotoStatePage
}: any) {
  const pathname = usePathname() ?? "";
  const href = GotoStatePage
    ? `/state/${categorySlug}`
    : `${configData.BASE_URL_CATEGORY}${categorySlug}`;
  const normalized = href.replace(/\/$/, "") || "/";
  const isActive =
    pathname === href ||
    pathname === normalized ||
    (normalized !== "/" && pathname.startsWith(`${normalized}/`));

  return (
    <Fragment>
      <li className="nav-item">
        <Link
          href={href}
          className={`nav-link${isActive ? " active" : ""}`}
        >
          {categoryName}
        </Link>
      </li>
    </Fragment>
  );
}

function CategoryWithChild({
  categoryId,
  categorySlug,
  categoryName,
  childMenu,
  GotoStatePage,
  isOpen,
  onToggle,
  onClose
}: any) {
  const pathname = usePathname() ?? "";
  const href = GotoStatePage
    ? `/state/${categorySlug}`
    : `${configData.BASE_URL_CATEGORY}${categorySlug}`;
  const normalized = href.replace(/\/$/, "") || "/";
  const parentActive =
    pathname === href ||
    pathname === normalized ||
    (normalized !== "/" && pathname.startsWith(`${normalized}/`));

  const megaMenuRef = useRef<HTMLLIElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleToggleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  return (
    <Fragment>
      <li 
        ref={megaMenuRef}
        className="nav-item dropdown mega-menu"
      >
        <Link
          href={href}
          className={`nav-link dropdown-toggle${parentActive ? " active" : ""}`}
          onClick={handleToggleClick}
        >
          {categoryName}
        </Link>

        <div 
          className="dropdown-menu"
          style={{ display: isOpen ? 'block' : 'none' }}
        >
          <div className="row m-0 p-0">
            <div className="col-lg-2 p-0">
              <div className="nav flex-column">
                {childMenu.map((cMenu: any, idx: number) => (
                  <MainMenuSubCategory
                    key={cMenu.ID}
                    categoryUrl={`${configData.BASE_URL_CATEGORY}${cMenu.ID}/${cMenu.MenuTitle}`}
                    categoryName={cMenu.MenuTitle}
                    dataTab={`${cMenu.ID}`}
                    categorySlug={cMenu.Slug}
                    GotoStatePage={cMenu.GotoStatePage}
                    isDefaultActive={idx === 0}
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

export default function NewMainMenuCategory({
  isChild,
  categoryId,
  categoryName,
  categorySlug,
  childMenu,
  GotoStatePage,
  isOpen,
  onToggle,
  onClose
}: any) {
  if (isChild) {
    return (
      <CategoryWithChild
        categoryId={categoryId}
        categorySlug={categorySlug}
        categoryName={categoryName}
        childMenu={childMenu}
        GotoStatePage={GotoStatePage}
        isOpen={isOpen}
        onToggle={onToggle}
        onClose={onClose}
      />
    );
  } else {
    return (
      <CategoryWithoutChild
        categorySlug={categorySlug}
        categoryName={categoryName}
        GotoStatePage={GotoStatePage}
      />
    );
  }
}

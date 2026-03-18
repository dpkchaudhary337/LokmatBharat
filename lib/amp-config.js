// Export config for AMP pages
const baseApiUrl = "https://api.lokmatbharat.com/api/Navtej/";
const baseAdminUrl = "https://admin.lokmatbharat.com/Admin/Login.aspx";
const baseUrl = "http://localhost:3000/";

let languageId = 3;

const configData = {
  baseAdminUrl: baseAdminUrl,
  baseApiUrl: baseApiUrl,
  languageId: languageId,
  BASE_URL_CATEGORY: "/category/",
  BASE_URL_SEARCH: "/news-search/?search=",
  BASE_URL_CATEGORY_DETAIL: "/details/",
  LIVE_DOMAIN: typeof window !== "undefined" ? window.location.origin : baseUrl,
  SESSION_TOKEN: "navtez87887",
  MENU_API_URL: `${baseApiUrl}getHeaderMenu?languageId=${languageId}`,
  POST_API_URL: `${baseApiUrl}getPosts?languageId=${languageId}&offset=#OFFSET&itemcount=16&categorySlug=#CATEGORY_SLUG&isFeature=0&isSlider=0&isSliderLeft=0&isSliderRight=0&isTrending=0&categoryId=0`,
  FEATURE_POST_API_URL: `${baseApiUrl}getPosts?languageId=${languageId}&offset=0&itemcount=10&categorySlug=#CATEGORY_SLUG&isFeature=1&isSlider=0&isSliderLeft=0&isSliderRight=0&isTrending=0&categoryId=0`,
  POST_DETAIL_API_URL: `${baseApiUrl}getPostById?languageId=${languageId}&postId=0&Slug=`,
  MARQUEE_API_URL: `${baseApiUrl}getPosts?languageId=${languageId}&offset=0&itemcount=10&categoryId=0&isFeature=1&isSlider=0&isSliderLeft=0&isSliderRight=0&isTrending=0&categorySlug=&=`,
  AD_API_URL: `${baseApiUrl}getAdvertisment?placementname=`,
  HOME_SLIDER_API_URL: `${baseApiUrl}getPosts?languageId=${languageId}&offset=0&itemcount=10&categoryId=0&isFeature=0&isSlider=1&isSliderLeft=0&isSliderRight=0&isTrending=0&categorySlug=`,
  HOME_Right_SLIDER_API_URL: `${baseApiUrl}getPosts?languageId=${languageId}&offset=0&itemcount=10&categoryId=0&isFeature=0&isSlider=0&isSliderLeft=0&isSliderRight=1&isTrending=0&categorySlug=`,
  HOME_CATEGORY_BASE_URL: `${baseApiUrl}getParentCategories?languageId=${languageId}`,
  SEARCH_API_URL: `${baseApiUrl}GetSearchContent?languageId=${languageId}&offset=#OFFSET&itemcount=10&searchKeyword=`,
  PER_PAGE_POST: 16,
  RELATED_NEWS_API_URL: `${baseApiUrl}GetRelatedNews?languageId=${languageId}&offset=0&itemcount=4&postId=`,
  NEWSLETTER_API: `${baseApiUrl}insertNewsletterEmail`,
  FOOTER_MENU_API_URL: `${baseApiUrl}GetFrontFooterMenu?languageId=${languageId}`,
  SETTING_URL: `${baseApiUrl}getSettings`,
  CONTACT_US: `${baseApiUrl}insertContactUs`,
  GET_CUSTOM_PAGE: `${baseApiUrl}getCustomPage?languageId=${languageId}&slug=`,
  GET_LANGUAGES: `${baseApiUrl}getLanguages`,
};

export default configData;

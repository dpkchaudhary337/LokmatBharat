const baseApiUrl = "http://navtejapi.sixwares.com/api/Navtej/";
const baseUrl = 'http://localhost:3000/'
let categoryID = 0;
const configData = {
    'BASE_URL_CATEGORY':'/category/',
    'BASE_URL_CATEGORY_DETAIL':'/details/',
    "SESSION_TOKEN":"navtez87887",
    "MENU_API_URL": baseApiUrl + "getHeaderMenu?languageId=3",
    "POST_API_URL": baseApiUrl + "getPosts?languageId=3&offset=#OFFSET&itemcount=10&categoryId=#CATEGORY_ID&isFeature=0&isSlider=0&isSliderLeft=0&isSliderRight=0&isTrending=0&=",
    "FEATURE_POST_API_URL": baseApiUrl + "getPosts?languageId=3&offset=0&itemcount=10&categoryId=#CATEGORY_ID&isFeature=1&isSlider=0&isSliderLeft=0&isSliderRight=0&isTrending=0&=",
    "POST_DETAIL_API_URL":baseApiUrl + "getPostById?languageId=3&Slug=",
    "MARQUEE_API_URL": baseApiUrl + "getPosts?languageId=3&offset=0&itemcount=10&categoryId=0&isFeature=1&isSlider=0&isSliderLeft=0&isSliderRight=0&isTrending=0&=",
    "AD_API_URL": baseApiUrl + "getAdvertisment?placementname=",
    "HOME_SLIDER_API_URL": baseApiUrl + "getPosts?languageId=3&offset=0&itemcount=10&categoryId=0&isFeature=0&isSlider=1&isSliderLeft=0&isSliderRight=0&isTrending=0&=",
    "HOME_CATEGORY_BASE_URL": baseApiUrl + "getParentCategories?languageId=3",
    "SEARCH_API_URL":baseApiUrl + "GetSearchContent?languageId=3&offset=0&itemcount=50&searchKeyword=",
    "PER_PAGE_POST":10,
}

export default configData;
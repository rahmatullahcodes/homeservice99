export const SECTION_KEYS = {
  CATEGORIES: "categories",
  SUBCATEGORIES: "subcategories",
  SERVICES: "services",
  CREATE: "create"
};

export const SECTION_ITEMS = [
  {
    key: SECTION_KEYS.CATEGORIES,
    title: "Categories",
    subtitle: "Parent level taxonomy management"
  },
  {
    key: SECTION_KEYS.SUBCATEGORIES,
    title: "Subcategories",
    subtitle: "Category-wise child groups"
  },
  {
    key: SECTION_KEYS.SERVICES,
    title: "Service List",
    subtitle: "Search, filter and moderate services"
  },
  {
    key: SECTION_KEYS.CREATE,
    title: "Add Service",
    subtitle: "Create or edit service details"
  }
];

export const INITIAL_FORM = {
  id: null,
  title: "",
  category: "",
  subcategory: "",
  price: "",
  image: "",
  active: true
};

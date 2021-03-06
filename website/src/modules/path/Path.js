import { presets } from '@mui-treasury/layout';
import { mapNestedPath } from '@mui-treasury/utils';
import {
  COMPONENT_MENUS,
  LAYOUT_MENUS,
  STYLE_MENUS,
} from '../../constants/menus';

const { edgeSidebar: { primarySidebar } } = presets.muiTreasury.clone();

const getHomeHandler = () => {
  return {
    pattern: /^\/$/,
  };
};

const getComponentHandler = () => {
  return {
    pattern: /\/components.*/g,
    sidebarMenus: COMPONENT_MENUS,
    getOpenKeys: () => [
      'mui-extended',
      'community-custom',
      'complex-composition',
    ],
  };
};

const getStylesHandler = () => {
  return {
    pattern: /\/styles.*/g,
    sidebarMenus: STYLE_MENUS,
    getOpenKeys: () => ['material-ui', 'custom-component', 'utility'],
  };
};

const getLayoutDevelop = () => {
  return {
    pattern: /\/layout\/develop/g,
    wrappedByLayout: false,
  };
};

const getLayoutV3Handler = () => {
  return {
    pattern: /\/layout\/v3.*/g,
    sidebarMenus: LAYOUT_MENUS,
    parseConfig: c => {
      if (c && c.lg) {
        c.lg.width = 300;
      }
    },
    getOpenKeys: () => [
      'v3',
      'tutorials-v3',
    ],
  };
};

const getLayoutPresetHandler = () => {
  return {
    pattern: /\/layout\/presets.*/g,
    sidebarMenus: LAYOUT_MENUS,
    getOpenKeys: () => [
      'presets',
    ],
  };
};

const getLayoutApiHandler = () => {
  return {
    pattern: /\/layout\/api-reference.*/g,
    sidebarMenus: LAYOUT_MENUS,
    getOpenKeys: () => [
      'api-reference',
      'builders',
      'layout-components',
    ],
  };
};

const getLayoutHandler = () => {
  return {
    pattern: /\/layout.*/g,
    sidebarMenus: LAYOUT_MENUS,
    parseConfig: () => {},
    getOpenKeys: () => [
      'tutorials',
      'advanced',
    ],
  };
};

const getFallbackHandler = () => {
  return {
    pattern: /.*/g,
    sidebarMenus: [],
    wrappedByLayout: true,
    parseConfig: c => {
      if (c && c.lg) {
        c.lg.width = primarySidebar.lg.width;
      }
    },
    getOpenKeys: ({ menus, lastPath }) => {
      const keyMap = mapNestedPath(menus);
      return Object.keys(keyMap).filter(key => keyMap[key].includes(lastPath));
    },
  };
};

const getFirstValue = (items, getValue) => {
  let result;
  items.forEach(item => {
    const value = getValue(item);
    if (result === undefined && value !== undefined) {
      result = value;
    }
  });
  return result;
};

const getPathValue = (pathname, key) =>
  getFirstValue(
    [
      getHomeHandler(),
      getStylesHandler(),
      getComponentHandler(),
      getLayoutDevelop(),
      getLayoutPresetHandler(),
      getLayoutV3Handler(),
      getLayoutApiHandler(),
      getLayoutHandler(),
      getFallbackHandler(),
    ],
    item => {
      const { pattern } = item;
      if (pattern.test(pathname) && item[key] !== undefined) {
        return item[key];
      }
      return undefined;
    }
  );

export default (location = {}) => {
  const { pathname } = location;
  return {
    sidebarMenus: getPathValue(pathname, 'sidebarMenus'),
    wrappedByLayout: getPathValue(pathname, 'wrappedByLayout'),
    parseConfig: getPathValue(pathname, 'parseConfig'),
    getOpenKeys: getPathValue(pathname, 'getOpenKeys'),
  };
};

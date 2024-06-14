// import { Navbar } from '@mantine/core';
// import { useMemo } from 'react';
// import { Box, Flex, Text, useColorScheme } from '@tw/ui-components';
// import { NavSection } from './RecursiveNavLink';
// import { useAppSelector } from 'reducers/RootType';
// import { capitalize, truncate } from 'lodash';
// import { selectNavigationSections } from 'constants/routes';
// import { useFilterMenu } from 'components/LeftSideNavigation/navigationHooks';
// import { StoresNav } from './StoresNav';
// import { SettingsAvatar } from './SettingsAvatar';
// import { ShopIcon } from './ShopIcon';

export interface INav {}

// TODO: Make sure to change default config when moved
export const Nav = () => {
  // // TODO: It's ok to use useColorScheme here, because we're going to move this component to ui-components before deployment
  // const { colorScheme } = useColorScheme();
  // const navigationSections = useAppSelector(selectNavigationSections);
  // const mainSections = useFilterMenu(navigationSections, 'main');
  // const currentShopId = useAppSelector((state) => state.currentShopId);
  // const darkMode = colorScheme === 'dark';

  // const formattedShopName = useMemo(
  //   () => truncate(capitalize(currentShopId?.replace('.myshopify.com', '')), { length: 17 }),
  //   [currentShopId]
  // );

  // const mainLinks = useMemo(() => {
  //   return mainSections.map((props) => {
  //     const key = `nav-link-${props.title}-${props.icon}`;
  //     return <NavSection key={key} {...props} />;
  //   });
  // }, [mainSections]);

  // return (
  //   <Navbar width={{ sm: 300 }} bg={darkMode ? '#161A22' : 'white'}>
  //     <Flex>
  //       <StoresNav />
  //       <Box w="100%">
  //         <Box
  //           mah={60}
  //           p={20}
  //           style={{ borderBottom: `1px solid ${darkMode ? '#262D3B' : '#DFE4EB'}` }}
  //         >
  //           <Flex justify="space-between" align="center">
  //             <Flex gap="xs" align="center">
  //               <ShopIcon />
  //               <Text color={darkMode ? 'white' : 'gray.5'} fz="md">
  //                 {formattedShopName}
  //               </Text>
  //             </Flex>
  //             <Flex gap="xs">
  //               <SettingsAvatar />
  //             </Flex>
  //           </Flex>
  //         </Box>
  //         <Box pos="relative" top={26}>
  //           <AppShell.Section grow px={16}>
  //             <Flex direction="column">{mainLinks}</Flex>
  //           </AppShell.Section>
  //         </Box>
  //       </Box>
  //     </Flex>
  //   </Navbar>
  // );

  return null;
};

import React from "react";
import { Entities } from "./pages/Entities/Entities";
import { theme } from "./theme";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper'
import { EntityDetails } from "./pages/EntityDetails/EntityDetails";


const App = () => {
   const Stack = createStackNavigator();

   const paperTheme: ReactNativePaper.Theme = {
      ...DefaultTheme,
      colors: {
         ...DefaultTheme.colors,
         ...theme.colors,
         accent: theme.colors.border
      }
   }
   return (
      <PaperProvider theme={paperTheme}>
         <NavigationContainer theme={theme}>
            <Stack.Navigator>
               <Stack.Screen
                  name="entities"
                  component={Entities}
                  options={{ title: 'Entidades', headerTitleAlign: 'center' }}
               ></Stack.Screen>
               <Stack.Screen
                  name="entityDetail"
                  component={EntityDetails}
                  options={{ title: 'Entidad', headerTitleAlign: 'center' }}
               ></Stack.Screen>
            </Stack.Navigator>
         </NavigationContainer>
      </PaperProvider>
   )
};





export default App;

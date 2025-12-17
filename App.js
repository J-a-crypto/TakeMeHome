import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from './screens/HomeScreen';
import PetListScreen from './screens/PetListScreen';
import PetHome from './screens/PetHome';
import PetFeed from './screens/PetFeed';
import PetLove from './screens/PetLove';
import PetHeal from './screens/PetHeal';
import { SafeAreaProvider } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="PetList" component={PetListScreen} />
          <Stack.Screen name="PetHome" component={PetHome} />

          <Stack.Screen name="PetFeed" component={PetFeed} />
          <Stack.Screen name="PetLove" component={PetLove} />
          <Stack.Screen name="PetHeal" component={PetHeal} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

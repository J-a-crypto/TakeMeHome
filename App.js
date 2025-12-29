import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PetsProvider } from './context/PetContext';
import { SoundProvider } from './context/SoundContext';
import SettingsModal from './components/SettingsModal';
import HomeScreen from './screens/HomeScreen';
import PetListScreen from './screens/PetListScreen';
import PetHome from './screens/PetHome';
import PetFeed from './screens/PetFeed';
import BouncyShooter from './screens/PetLove';
import PetHeal from './screens/PetHeal';
import { SafeAreaProvider } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <SoundProvider>
        <PetsProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="PetList" component={PetListScreen} />
              <Stack.Screen name="PetHome" component={PetHome} />

              <Stack.Screen
                name="PetFeed"
                component={PetFeed}
                options={{ gestureEnabled: false }} // <-- disables swipe back
              />
              <Stack.Screen
                name="PetLove"
                component={BouncyShooter}
                options={{ gestureEnabled: false }}
              />
              <Stack.Screen
                name="PetHeal"
                component={PetHeal}
                options={{ gestureEnabled: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <SettingsModal />
        </PetsProvider>
      </SoundProvider>
    </SafeAreaProvider>
  );
}

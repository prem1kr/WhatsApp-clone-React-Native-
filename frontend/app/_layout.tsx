import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/welcome" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{headerShown: false}} />
      <Stack.Screen name="(main)/home" options={{headerShown:false}} />
      <Stack.Screen name="(main)/profileModel" options={{ presentation:"modal", headerShown:false}} />
      <Stack.Screen name="(main)/newConversationModel" options={{presentation:"modal" , headerShown:false}} />
      <Stack.Screen name="(main)/conversation" options={{presentation:"modal" , headerShown:false}} />
    

      
    </Stack>
  );
}

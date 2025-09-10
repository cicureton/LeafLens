import { Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";

const _layout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: "For You",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <>
              <Image
                source={require("../../assets/images/ForYou.png")}
                className="size-7"
              />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: "Forum",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <>
              <Image
                source={require("../../assets/images/Forum.png")}
                className="size-7"
              />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          tabBarLabel: () => null,
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../../assets/images/Camera.png")}
              className="size-20"
              style={{ tintColor: focused ? "#2e8b57" : "#00A86B" }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="plants"
        options={{
          title: "Plants",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <>
              <Image
                source={require("../../assets/images/Plants.png")}
                className="size-7"
              />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <>
              <Image
                source={require("../../assets/images/Profile.png")}
                className="size-7"
              />
            </>
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;

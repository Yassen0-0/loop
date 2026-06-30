import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { HabitsScreen } from '../screens/habits/HabitsScreen';
import { JournalGoalsScreen } from '../screens/journal/JournalGoalsScreen';
import { ReligionScreen } from '../screens/religion/ReligionScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { StatsScreen } from '../screens/stats/StatsScreen';
import { useAppTheme } from '../shared/theme/ThemeProvider';

export type RootTabParamList = {
  Habits: undefined;
  Journal: undefined;
  Religion: undefined;
  Settings: undefined;
  Stats: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function AppNavigator() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const navigationTheme = theme.mode === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          background: theme.colors.background,
          border: theme.colors.border,
          card: theme.colors.glass,
          primary: theme.colors.primary,
          text: theme.colors.text,
        },
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarBackground: () => (
            <BlurView
              intensity={theme.mode === 'dark' ? 34 : 58}
              tint={theme.mode}
              style={StyleSheet.absoluteFill}
            />
          ),
          tabBarIcon: ({ color, focused }) => {
            const iconName = getTabIcon(route.name, focused);

            return (
              <View
                style={[
                  styles.iconWrap,
                  focused && {
                    backgroundColor: theme.colors.primarySoft,
                    borderColor: theme.colors.borderStrong,
                  },
                ]}
              >
                <Ionicons name={iconName} size={22} color={color} />
              </View>
            );
          },
          tabBarInactiveTintColor: theme.colors.muted,
          tabBarItemStyle: styles.tabItem,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: {
            alignItems: 'center',
            backgroundColor: theme.colors.glass,
            borderColor: theme.colors.border,
            borderRadius: 26,
            borderWidth: 1,
            elevation: 0,
            height: 74,
            justifyContent: 'center',
            marginBottom: 16,
            marginHorizontal: 18,
            overflow: 'hidden',
            paddingHorizontal: 6,
            position: 'absolute',
            shadowColor: theme.colors.shadow,
            shadowOpacity: theme.mode === 'dark' ? 0.28 : 0.14,
            shadowRadius: 20,
          },
        })}
      >
        <Tab.Screen
          name="Habits"
          component={HabitsScreen}
          options={{ title: t('navigation.habits') }}
        />
        <Tab.Screen
          name="Journal"
          component={JournalGoalsScreen}
          options={{ title: t('navigation.journal') }}
        />
        <Tab.Screen
          name="Religion"
          component={ReligionScreen}
          options={{ title: t('navigation.religion') }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{ title: t('navigation.stats') }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarButton: () => null,
            title: t('navigation.settings'),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 14,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    marginBottom: 4,
    width: 40,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 2,
    textAlign: 'center',
  },
});

function getTabIcon(
  routeName: keyof RootTabParamList,
  focused: boolean,
): keyof typeof Ionicons.glyphMap {
  if (routeName === 'Habits') {
    return focused ? 'checkmark-circle' : 'checkmark-circle-outline';
  }

  if (routeName === 'Journal') {
    return focused ? 'create' : 'create-outline';
  }

  if (routeName === 'Religion') {
    return focused ? 'moon' : 'moon-outline';
  }

  if (routeName === 'Stats') {
    return focused ? 'bar-chart' : 'bar-chart-outline';
  }

  return focused ? 'settings' : 'settings-outline';
}

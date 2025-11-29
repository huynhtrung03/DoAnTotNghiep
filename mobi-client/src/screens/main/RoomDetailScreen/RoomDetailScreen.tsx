import React, { useCallback } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import RoomCartDetail from '../../../components/rooms/RoomDetail/components/RoomCartDetail';
import Colors from '../../../styles/colors';
import { useFavoriteStore } from '../../../stores/FavoriteStore';
import { getAllFavoriteIds } from '../../../services/FavoriteService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RoomDetailScreen({ route, navigation }: any) {
  const { roomId } = route.params;
  const { setFavoriteRoomIds } = useFavoriteStore();

  // Reload favorites when screen is focused
  useFocusEffect(
    useCallback(() => {
      const reloadFavorites = async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (token) {
            const favoriteIds = await getAllFavoriteIds();
            setFavoriteRoomIds(favoriteIds);
            //console.log(` RoomDetailScreen: Reloaded ${favoriteIds.length} favorites`);
          }
        } catch (error) {
          console.error(' Error reloading favorites in RoomDetailScreen:', error);
        }
      };
      reloadFavorites();
    }, [setFavoriteRoomIds])
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Use RoomCartDetail component */}
      <RoomCartDetail roomId={roomId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});


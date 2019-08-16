import React from 'react';
import {
  Text, View, ScrollView, Dimensions
} from 'react-native';

import Song from './Song';

const { height } = Dimensions.get('window');

const RoomSongsContainer = props => (
  <View style={{ flex: 1, height: height / 2 }}>
    <Text style={styles.title}>{props.title}</Text>
    <ScrollView>
      {(props.next && props.songs.length === 0)
        ? <Text style={styles.title}>Add songs to the queue!</Text> : null}
      <View>
        {props.songs.map(song => (
          <Song
            id={song.id}
            name={song.name}
            artists={song.artists[0].name}
            images={song.album.images}
            key={song.id}
          />
        ))}
      </View>
    </ScrollView>
  </View>
);

const styles = {
  title: {
    alignSelf: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    margin: 15
  }
};

export default RoomSongsContainer;

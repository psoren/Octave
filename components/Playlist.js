import React, { Component } from 'react';
import { Text, View, Image, FlatList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';

import Song from './Song';

class Playlist extends Component {

    state = {
        albumArtExists: false,
        loading: true,
        uris: []
    };

    componentDidMount = async () => {
        const infoArr = this.props.uri.split(':');
        const id = infoArr[2];
        let accessToken = await AsyncStorage.getItem('accessToken');

        //Get playlist
        const config = { headers: { 'Authorization': `Bearer ${accessToken}` } };
        let { data } = await axios.get(`https://api.spotify.com/v1/playlists/${id}`, config);

        if (data.images[0].url) {
            this.setState({
                albumArtExists: true,
                albumArt: data.images[0].url
            })
        }
        this.setState({ name: data.name });

        // //Get playlist songs
        let result = await axios.get(`https://api.spotify.com/v1/playlists/${id}/tracks`, config);
        let uris = result.data.items.map(songObj => songObj.track.uri);
        this.setState({ uris: uris, loading: false });
    }

    keyExtractor = (item, _) => item;

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{this.state.name}</Text>
                {this.state.albumArtExists ?
                    <Image source={{ uri: this.state.albumArt }}
                        style={styles.albumArt} />
                    : <Image source={require('../assets/default_album.png')}
                        style={styles.albumArt} />
                }
                <FlatList
                    data={this.state.uris}
                    renderItem={({ item }) => <Song uri={item} />}
                    keyExtractor={this.keyExtractor}
                />
            </View>
        );
    }
}

const styles = {
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: '#fff',
        marginTop: 50
    },
    albumArt: {
        height: 200,
        width: 200,
        alignSelf: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        alignSelf: 'center'
    }
};

export default Playlist;
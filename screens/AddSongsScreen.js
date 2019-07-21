import React, { Component } from 'react';
import { ButtonGroup } from 'react-native-elements';
import { View } from 'react-native';
import SearchContent from '../components/SearchContent';
import LibraryPlaylists from '../components/LibraryPlaylists';

class AddSongsScreen extends Component {
    state = { selectedIndex: 0 };

    updateIndex = newIndex => this.setState({ selectedIndex: newIndex });

    render() {
      const buttons = ['Spotify', 'Your Library'];
      const { selectedIndex } = this.state;

      return (
        <View style={styles.container}>
          <ButtonGroup
            onPress={this.updateIndex}
            selectedIndex={selectedIndex}
            buttons={buttons}
            containerStyle={styles.buttonGroup}
          />
          {selectedIndex === 0 ? <SearchContent /> : <LibraryPlaylists />}
        </View>
      );
    }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  buttonGroup: {
    height: 30,
    borderRadius: 7
  }
};

export default AddSongsScreen;

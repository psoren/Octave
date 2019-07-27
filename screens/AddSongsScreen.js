import React, { Component } from 'react';
import { ButtonGroup } from 'react-native-elements';
import { View } from 'react-native';
import { connect } from 'react-redux';
import SearchContent from '../components/SearchContent';
import LibraryPlaylists from '../components/LibraryPlaylists';

class AddSongsScreen extends Component {
  state = { selectedIndex: 0 };

  updateIndex = newIndex => this.setState({ selectedIndex: newIndex });

  render() {
    const buttons = ['Spotify', 'Your Library'];
    const { selectedIndex } = this.state;

    return (
      <View style={[styles.container,
        this.props.currentRoom.id ? { marginTop: 50 } : {}]}
      >
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

const mapStateToProps = ({ currentRoom }) => ({ currentRoom });

export default connect(mapStateToProps, null)(AddSongsScreen);

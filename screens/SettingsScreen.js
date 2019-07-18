import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Icon } from 'react-native-elements';

class SettingsScreen extends Component {

    static navigationOptions = ({ navigation }) => ({
        title: 'Settings',
        tabBarIcon: ({ tintColor }) =>
            <Icon
                type='material'
                name='settings'
                size={30}
                color={tintColor}
            />
    });

    render() {
        return (
            <View style={styles.container}>
                <Text>SettingsScreen</Text>
                <Text>SettingsScreen</Text>
                <Text>SettingsScreen</Text>
                <Text>SettingsScreen</Text>
                <Text>SettingsScreen</Text>
            </View>
        )
    }
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#fff'
    }
};

export default SettingsScreen;
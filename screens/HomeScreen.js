import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Button, Icon } from 'react-native-elements';

class HomeScreen extends Component {

    static navigationOptions = ({ navigation }) => ({
        title: 'Home',
        tabBarIcon: ({ tintColor }) =>
            <Icon
                type='material'
                name='home'
                size={30}
                color={tintColor}
            />
    });

    render() {
        return (
            <View style={styles.container}>
                <Text>HomeScreen</Text>
                <Text>HomeScreen</Text>
                <Text>HomeScreen</Text>
                <Text>HomeScreen</Text>
                <Text>HomeScreen</Text>
            </View>
        );
    }
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#fff'
    }
};

export default HomeScreen;
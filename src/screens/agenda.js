import React, { Component } from 'react'
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
    ToastAndroid
} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import moment from 'moment'
import 'moment/locale/pt-br'
import todayImage from '../../assets/imgs/today.jpg'
import commonStyles from '../commonStyles'
import Task from '../components/Task'
import AddTask from './AddTask'
import {Icon} from 'native-base'
import Icons from 'react-native-vector-icons/FontAwesome'

export default class screens extends Component {

    state = {
        tasks: [],
        visibleTasks: [],
        showDoneTasks: true,
        showAddTask: false,
    }

    addTask = task => {
        const tasks = [...this.state.tasks]
        tasks.push({
            id: Math.random(),
            desc: task.desc,
            estimateAt: task.date,
            doneAt: null
        })
        this.setState({ tasks, showAddTask: false }, this.filterTasks)
    }

    deleteTask = id => {
        const tasks = this.state.tasks.filter(task => task.id !== id)
        this.setState({ tasks }, this.filterTasks)
    }

    filterTasks = () => {
        let visibleTasks = true
        if (!this.state.showDoneTasks) {
            const pending = task => task.doneAt
            visibleTasks = this.state.tasks.filter(pending)
        } else {
            visibleTasks = [...this.state.tasks]
        }
        this.setState({ visibleTasks })
        AsyncStorage.setItem('tasks', JSON.stringify(this.state.tasks))
    }

    toggleFilter = () => {
        this.setState({ showDoneTasks: !this.state.showDoneTasks }, this.filterTasks)
        this.state.showDoneTasks ? ToastAndroid.show('Estas são as tarefas concluídas', ToastAndroid.SHORT) : ToastAndroid.show('Estas são todas as tarefas', ToastAndroid.SHORT)
        
    }

    componentDidMount = async () => {
        const data = await AsyncStorage.getItem('tasks')
        const tasks = JSON.parse(data) || []
        this.setState({tasks}, this.filterTasks)
    }

    toggleTask = id => {
        const tasks = [...this.state.tasks]
        tasks.forEach(task => {
            if (task.id === id) {
                task.doneAt = task.doneAt ? null : new Date()
            }
        })
        this.setState({ tasks }, this.filterTasks)
    }

    render() {
        return (
            <View style={styles.container}>
                <AddTask isVisible={this.state.showAddTask} onSave={this.addTask} onCancel={() => this.setState({ showAddTask: false })} />
                <ImageBackground source={todayImage} style={styles.background}>
                    <View style={styles.iconBar}>
                        <TouchableOpacity onPress={this.toggleFilter}>
                            <Icons name={this.state.showDoneTasks ? 'eye' : 'eye-slash'} size={20} color={commonStyles.colors.secondary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>Hoje</Text>
                        <Text style={styles.subtitle}>{moment().locale('pt-br').format('ddd, D [de] MMMM [de] YYYY')}</Text>
                    </View>
                </ImageBackground>
                <View style={styles.tasksContainer}>
                    <FlatList data={this.state.visibleTasks} keyExtractor={item => `${item.id}`} renderItem={({ item }) =>
                        <Task {...item} toggleTask={this.toggleTask} onDelete={this.deleteTask} />} />
                </View>
                <View style={styles.viewAdd}>
                <TouchableOpacity style={styles.btn} onPress={() => { this.setState({showAddTask: true}) }}>
                    <Icon
                        name='add'
                        style={{ color: commonStyles.colors.secondary }}
                    />
                </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    background: {
        flex: 3,
    },
    titleBar: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    title: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 50,
        marginLeft: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 20,
        marginLeft: 20,
        marginBottom: 30
    },
    tasksContainer: {
        flex: 7,
    },
    iconBar: {
        marginTop: Platform.OS === 'ios' ? 30 : 10,
        marginHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    btn: {
        borderColor: commonStyles.colors.today,
        borderWidth: 3,
        backgroundColor: commonStyles.colors.today,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        position: 'absolute',
    },
    viewAdd: {
        backgroundColor: (0, 0, 0),
        position: 'absolute',
        height: 50,
        width: 50,
        bottom: 40,
        right: 20
    },
})
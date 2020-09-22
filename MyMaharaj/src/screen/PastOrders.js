import React from 'react';
import { Text, StyleSheet, ImageBackground , Image, View , TouchableOpacity , FlatList  } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment'

export default class PastOrders extends React.Component{
    constructor(props){
        super(props)
        this.state ={
            location : '',
            data:[]
        }
    }
    onFocusFunction = async() =>{
        this.getloc() 
        this.getOrder()     
    }
    getloc = async() =>{
        const location = await AsyncStorage.getItem('Location')
        const loc = JSON.parse(location)
        console.log(loc)
        location !== null ? 
            this.setState({
                location : loc.title
            }) :
            this.setState({
                location : 'Please add your location'
            })
    }
    getOrder = async() =>{
        let token = await AsyncStorage.getItem('token')
            console.log(token)
            this.state.data = []
            fetch('https://maharaj-3.herokuapp.com/api/v1/req/past',
            {
                method:'GET',
                headers:{
                    "Authorization":token,
                    "Content-Type":"application/json"
                }
            }, ).then((response) => 
                response.json()
            
        ).then((data) =>{
            console.log(data.data)
            this.state.data.push(...data.data)
        }).then(() => {
            fetch('https://maharaj-3.herokuapp.com/api/v1/req/ongoing',
            {
                method:'GET',
                headers:{
                    "Authorization":token,
                    "Content-Type":"application/json"
                }
            }, ).then((response) => 
                response.json()
            
        ).then((data1) =>{
            const result = data1.data.map((d) => {
              return moment(new Date).isBefore(d.bookingDate) ? null : d
            }).filter(d => d !== null)
            this.state.data.push(...result)
            console.log("Past Order => ")
            console.log(this.state.data)
            this.setState({data : this.state.data})
        })
        })
    }
    componentDidMount= async() => {
            
            this.getOrder()
            this.focusListner = this.props.navigation.addListener('didFocus' , () =>{
                this.onFocusFunction()
            })
    }
      componentWillUnmount() {
          if(this.focusListner.remove()){
              this.focusListener.remove()
         }
      }

render(){
    return(
        <View style = {style.container}>
            <View style={{backgroundColor:'black'}}>
            <Text style = {{margin:18,fontSize:20 , fontWeight:'bold',marginBottom:10,color:'white'}}>Past / Completed Orders</Text>
            </View>
        {this.state.data.toString() == "" ? 
            <View style={{justifyContent:'center',flex:1}}>
                <Image source ={require('../images/hat.png')} style ={{height:200 , width:200 , justifyContent:'center',alignSelf:'center'}}/>
                <Text style={style.Company}>
                MyMaharaj Inc.
            </Text>
            </View>
                :
            <FlatList
             data={this.state.data.reverse()}
             renderItem ={ ({ item, index }) =>
            <TouchableOpacity style={style.box} onPress={() => {this.props.navigation.navigate('Details',{'details':item})}}>
                <View style={{ flexDirection: 'column' , alignItems:"center"}}>
                <Image source ={require('../images/hat.png')} style ={{height:70 , width:100 }}/>
                    <Text style={style.boxText2 }>REQUEST ID: {item._id} </Text>
                    <Text style={style.boxText2}>Date of Booking: {`${[item.bookingDate].toLocaleString().slice(8,10)}/${[item.bookingDate].toLocaleString().slice(5,7)}/${[item.bookingDate].toLocaleString().slice(0,4)}`} </Text>
                    <Text style={style.boxText2}>Time of Booking : {moment(item.bookingTime,"hh:mm").format("h:mm A")}</Text>
                    <Text style={style.boxText}>Status : {item.status === "ongoing" ? "Order Not completed" : item.status}</Text>
                </View>
            </TouchableOpacity>
            
             }
            />
        }
        </View>
)}
}
const style = StyleSheet.create({
    container: {
        flex:1,
    },

    text:{
        color:'white',
        fontSize:50,
        textAlign:'center'
    } ,
    TouchableOpacityStyle: {
        position: 'absolute',
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        right: 30,
        bottom: 30,
        backgroundColor:'#000',
        borderRadius:70
      },
    
      box: {
        borderColor: 'black',
        margin: 10,
        borderWidth: 1 ,
        backgroundColor:'#fff',
    },
    boxText: {
        color: 'black',
        margin: 5,
        fontSize:15,
        

    },
    boxText2: {
        color: 'black',
        margin: 5,
        fontSize:15,
        marginBottom:0

    },
    Company :{
        alignSelf:'center',
        marginBottom:20,
        fontWeight:"400",
        fontSize:25,
    },

})

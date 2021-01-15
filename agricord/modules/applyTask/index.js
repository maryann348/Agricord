import React, {Component} from 'react';
import {View, Text, ScrollView, Dimensions} from 'react-native';
import {
  faHistory,
  faFlask,
  faTractor,
  faTh,
} from '@fortawesome/free-solid-svg-icons';
import {BasicStyles, Routes, Color} from 'common';
import Task from 'modules/applyTask/Task';
import RecentTasks from 'modules/applyTask/RecentTasks';
import CustomPicker from 'modules/applyTask/CustomPicker.js';
import styles from 'modules/applyTask/Styles.js';
import {connect} from 'react-redux';
import ThCircleSvg from 'assets/settings/thcircle.svg';
import {Spinner} from 'components';
import Api from 'services/api';
import SlidingButton from 'modules/generic/SlidingButton';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
const height = Math.round(Dimensions.get('window').height);

class ApplyTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMachine: null,
      selectedMix: null,
      selectedPicker: 0,
      isLoading: false,
      data: null,
      isPressed: false
    };
    if(this.props.navigation.state.params) {
    } else {
      this.props.state.task = null;
    }
  }

  componentDidMount(){
    console.log("selected", this.state.selectedPicker, this.state.isPressed);
    const {user } = this.props.state;
    if (user == null) {
      return
    }
    this.setActive()
    const parameter = {
      merchant_id: user.sub_account.merchant.id
    };
    this.setState({isLoading: true});
    Api.request(Routes.batchesRetrieveApplyTasks, parameter, response => {
        this.setState({isLoading: false});
        this.setState({data: response.data});
        if(this.props.state.task) {
          this.setState({selectedMix: this.props.state.task.spray_mix.name})
        }
      }, error => {
        this.setState({isLoading: false});
        console.log({error});
      },
    );
  }

  setActive(){
    const { task } = this.props.state;
    if(task != null && task.spray_mix != null){
      this.setState({
        selectedMix: task.spray_mix
      })
    }
    if(task != null && task.machine !== null){
      this.setState({
        selectedMachine: task.machine
      })
    }
  }

  recentMachineHandler = item => {
    const { selectedMachine } = this.state;
    if(selectedMachine && selectedMachine.id == item.id){
      this.setState({selectedMachine: null})
    }else{
      this.setState({selectedMachine: item});
    }
  };

  recentMixHandler = item => {
    const { selectedMix } = this.state;
    if(selectedMix && selectedMix.id == item.id){
      this.setState({
        selectedMix: null
      })
    }else{
      this.setState({selectedMix: item});
    }
  };

  pickerMachineHandler = item => {
    this.setState({selectedMachine: item});
    this.setState({isPressed: false});
  };

  pickerMixHandler = item => {
    this.setState({selectedMix: item});
  };

  handleSelectedPicker = (index, isPressed) => {
    this.setState({selectedPicker: index});
    this.setState({isPressed: isPressed});
  };

  selectPaddocks = () => {
    const { setTask } = this.props;
    const { selectedMachine, selectedMix } = this.state;
    const { task } = this.props.state;
    if (this.state.selectedMachine != null && this.state.selectedMix != null) {
      let task = {
        machine: selectedMachine,
        spray_mix: selectedMix
      };
      setTask(task);
      this.props.navigation.navigate('mixPageStack', {
        data: {
          machine: selectedMachine,
          spray_mix: selectedMix
        }
      });
    } else {
      alert('Please select a machine or mix.');
    }
  };

  handleRemoveItem = item => {
    switch (item) {
      case 'Machine':
        this.setState({selectedMachine: null});
        break;
      case 'Mix':
        this.setState({selectedMix: null});
        break;
      default:
        break;
    }
  };

  render() {
    const { data, selectedMix, selectedMachine } = this.state;
    const { task } = this.props.state;
    return (
      <View style={styles.MainContainer}>
        <View style={styles.Contain}></View>
        <ScrollView style={{backgroundColor: Color.containerBackground, minHeight: height, position: 'relative', zIndex: 0}}>
          <View style={[styles.ApplyTaskContainer, {zIndex: 0, position: 'relative'}]}>
            {
              data && (
                <Task title="Recent" icon={faHistory} height={240} key={1}>
                  <RecentTasks
                    data={data.recent_machines}
                    type="Machine"
                    title="Machines"
                    key={1}
                    selected={selectedMachine}
                    handleSelect={this.recentMachineHandler}
                    handleRemoveItem={() => this.recentMachineHandler(null)}
                  />
                  <RecentTasks
                    type="Mix"
                    data={data.recent_spray_mixes}
                    title="Spray Mixes"
                    key={2}
                    selected={selectedMix}
                    handleSelect={this.recentMixHandler}
                    handleRemoveItem={() => this.recentMixHandler(null)}
                  />
                </Task>
              )
            }
            
            <View style={{
                width: '100%',
                alignItems: 'center',
                position: 'relative',
                zIndex: 0
              }}>
              {
                data && (
                  <View style={[styles.SelectContainer, {
                    position: 'relative',
                    zIndex: 2
                  }]}>
                    <View style={styles.SelectTitleContainer}>
                      <View style={styles.TitleIconContainer}>
                        <FontAwesomeIcon
                          color="#FFCA0C"
                          icon={faTh}
                          size={25}
                          style={styles.iconStyle}
                        />
                      </View>
                      <View style={styles.TitleTextContainer}>
                        <Text style={styles.TitleTextStyle}>Select</Text>
                      </View>
                    </View>
                  <View style={[styles.ChildrenContainer, {
                    zIndex: 10
                  }]}>
                      <CustomPicker
                        type="Machine"
                        data={data.machines}
                        key={1}
                        select={selectedMachine}
                        styles={{zIndex: 500}}
                        handleSelect={this.pickerMachineHandler}
                        index={1}
                        allowOpen={this.state.selectedPicker === 1 ? true : false}
                        handleSelectedPicker={this.handleSelectedPicker}
                        handleRemoveItem={() => this.pickerMachineHandler(null)}
                        zIndex={30}
                      />
                      { (this.state.selectedPicker === 0 ||  this.state.selectedPicker === 2 || this.state.isPressed === false)
                           && (
                          <CustomPicker
                            type="Mix"
                            data={data.spray_mixes}
                            key={2}
                            styles={{zIndex: 500}}
                            select={selectedMix}
                            selected={task != null ? task.spray_mix : null}
                            handleSelect={this.pickerMixHandler}
                            index={2}
                            allowOpen={this.state.selectedPicker === 2 ? true : false}
                            handleSelectedPicker={this.handleSelectedPicker}
                            handleRemoveItem={() => this.pickerMixHandler(null)}
                            zIndex={25}
                          />
                        )
                      }
                    </View>
                  </View>
                )
              }
            </View>
          </View>
        </ScrollView>
        {this.state.isLoading ? <Spinner mode="overlay" /> : null}
        {
          (this.state.selectedMachine != null && this.state.selectedMix != null) && (
            <SlidingButton
              title={'Select Paddocks'}
              label={'Swipe Right to Complete'}
              onSuccess={() => this.selectPaddocks()}
              />
          )
        }
      </View>
    );
  }
}

const mapStateToProps = state => ({state: state});

const mapDispatchToProps = dispatch => {
  const {actions} = require('@redux');
  return {
    setTask: task => dispatch(actions.setTask(task)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ApplyTask);

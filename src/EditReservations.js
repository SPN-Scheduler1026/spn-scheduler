import React, {Component} from 'react';
import './EditReservations.css'
import moment from 'moment'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

class EditReservations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userID : 478,
            buildingID : 1,
            orderBy: 1,
            events : []
        }
    }

    // This is the creation of the list items
    createItem(item) {
        return(
            <EventDropdown event={item} />
        )
    }

    createItems(items) {
        return(items.map(this.createItem));
    }

    getReservations() {
        //Get the room reservation data from the server
        fetch('/userReservations', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid: this.state.userID,
                bid: this.state.buildingID,
                orderBy: this.state.orderBy,
            }),
        })
            .then(response => response.json())
            .then(reservations => {
                let events = [];

                reservations.map(record => {
                    events.push({
                        roomID: record.roomID,
                        start_datetime: record.start_datetime,
                        end_datetime: record.end_datetime,
                        title: record.title,
                        event_detail: record.event_detail,
                        recordID: record.recordID,
                        recurring_recordID: record.recurring_recordID,
                        room_name: record.room_name,
                    });
                    return null;
                });

                this.setState({events: events});
            });
    }

    componentDidMount(){
        this.getReservations();
    }

    render() {
        return(
            <div>
                <div className = 'page-title'>My Reservations</div>
                <div className = 'event-list-wrapper'>
                    {this.createItems(this.state.events)}
                </div>
            </div>
        );
    }
}

class EventDropdown extends Component {
    constructor(props) {
        super(props);

        let currentEvent = this.props.event;

        let rawDateStart = String(currentEvent.start_datetime);
        let rawDateEnd = String(currentEvent.end_datetime);

        let dateObjectStart = this.convertDate(rawDateStart);
        let dateObjectEnd = this.convertDate(rawDateEnd);

        moment.locale('en');
        let startDate = moment(dateObjectStart).format('LL');
        let startTime = moment(dateObjectStart).format('LT');
        let endTime = moment(dateObjectEnd).format('LT');

        this.showDDContent = this.showDDContent.bind(this);
        this.closeDDContent = this.closeDDContent.bind(this);
        this.ddEditClick = this.ddEditClick.bind(this);
        this.ddCancelClick = this.ddCancelClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
        this.handleEndTimeChange = this.handleEndTimeChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            eventObject: this.props.event,
            title: this.props.event.title,
            description: this.props.event.event_detail,
            dateObjectStart: dateObjectStart,
            dateObjectEnd: dateObjectEnd,
            startDate: startDate,
            startTime: startTime,
            endTime: endTime,
            room_name: this.props.event.room_name,
            roomID: this.props.event.roomID,
            recordID: this.props.event.recordID,
            tempDate: dateObjectStart,
            tempStartTime: dateObjectStart,
            tempEndTime: dateObjectEnd,
            tempTitle: this.props.event.title,
            tempDescription: this.props.event.event_detail,
            recurring: this.props.event.recurring_recordID,
        }
    }

    showDDContent(event){
        event.preventDefault();

        this.setState({showDDContent: true}, () => {
            if (!this.state.ddEditClick)
                document.addEventListener('click', this.closeDDContent);
        });
    }

    closeDDContent(event){
        if(!this.dropdownMenu.contains(event.target)){
            this.setState({showDDContent: false}, () => {
                document.removeEventListener('click', this.closeDDContent);
            });
        }
    }

    ddEditClick(event) {
        this.setState({showDDContent: true, ddEditClick: true}, () => {
            document.removeEventListener('click', this.closeDDContent);
        });
    }

    ddCancelClick(event) {
        this.setState({
            showDDContent: true,
            ddEditClick: false,
            tempDate: this.state.dateObjectStart,
            tempStartTime: this.state.dateObjectStart,
            tempEndTime: this.state.dateObjectEnd,
            tempTitle: this.state.title,
            tempDescription: this.state.description,
        }, () => {
            document.addEventListener('click', this.closeDDContent);
        });
    }

    convertDate(rawDate) {
        let rawDateSplit = rawDate.split(/[- :T]/);
        let t = rawDateSplit.map(item => parseInt(item, 10));

        return (new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5])));
    }

    convertDateTime(rawDate, rawTime) {
        let stringDate = moment(rawDate).format('YYYY-MM-DD');
        let stringTime = moment(rawTime).format('HH:mm:ss');

        let fullString = stringDate + ' ' + stringTime;

        return fullString;
    }

    handleChange(event) {
        return this.setState({[event.target.name]: event.target.value});

    }

    handleDateChange(date) {
        this.setState({tempDate: date});
    }

    handleStartTimeChange(time) {
        this.setState({tempStartTime: time});
    }

    handleEndTimeChange(time) {
        this.setState({tempEndTime: time});
    }

    handleSubmit(event) {
        event.preventDefault();

        fetch('/editReservation', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recordID: this.state.recordID,
                start_datetime: this.convertDateTime(this.state.tempDate, this.state.tempStartTime),
                end_datetime: this.convertDateTime(this.state.tempDate, this.state.tempEndTime),
                title: this.state.tempTitle,
                event_detail: this.state.tempDescription,
                recurring: this.state.recurring,
            }),
        });

        window.location.reload();
    }

    render() {
        return(
            // The shown portion of the individual events
            <div className='dd-list-container'>
                <div className = 'dd-list-header' onClick={this.showDDContent}>
                    <div className = 'event-item'>
                        Room: {this.state.room_name}
                    </div>
                    <div className = 'event-item'>
                        Date: {this.state.startDate}
                    </div>
                    <div className = 'event-item'>
                        Time: {this.state.startTime} - {this.state.endTime}
                    </div>
                    <div className = 'event-item'>
                        Title: {this.state.title}
                    </div>
                </div>
                {
                    this.state.showDDContent ? (
                        <div className = 'dd-list-content' ref={(element) => {this.dropdownMenu = element;}}>

                            <div className = 'dd-list-items'>
                                Description: {this.state.description}
                            </div>
                            {
                                !this.state.ddEditClick ? (
                                    <button className = 'dd-edit-button' onClick={this.ddEditClick}>EDIT</button>
                                ) : (
                                    // Edit form for events shown on 'edit' click
                                    <div className = 'dd-form-content'>
                                        <form className = 'dd-edit-form' onSubmit={this.handleSubmit}>
                                            <label className = 'dd-edit-item'>
                                                Title:
                                                <input name = 'tempTitle' type="text" value={this.state.tempTitle} onChange={this.handleChange} />
                                            </label>
                                            <label className = 'dd-edit-item'>
                                                Description:
                                                <input name = 'tempDescription' type="text" value={this.state.tempDescription} onChange={this.handleChange} />
                                            </label>
                                            <label className = 'dd-edit-item'>
                                                Date :
                                                <DatePicker
                                                    name = 'tempStartDate'
                                                    selected={this.state.tempDate}
                                                    onChange={this.handleDateChange}
                                                    timeIntervals={30}
                                                    dateFormat="MMMM d, yyyy"
                                                    timeCaption="Start"
                                                />
                                            </label>
                                            <label className = 'dd-edit-item'>
                                                Start Time :
                                                <DatePicker
                                                    name = 'tempStartTime'
                                                    selected={this.state.tempStartTime}
                                                    onChange={this.handleStartTimeChange}
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    //minTime={this.state.dayStart}
                                                    //maxTime={this.state.maxStartTime}
                                                    timeIntervals={30}
                                                    dateFormat="h:mm aa"
                                                    timeCaption="Start"
                                                />
                                            </label>
                                            <label className = 'dd-edit-item'>
                                                End Time :
                                                <DatePicker
                                                    name = 'tempEndTime'
                                                    selected={this.state.tempEndTime}
                                                    onChange={this.handleEndTimeChange}
                                                    showTimeSelect
                                                    showTimeSelectOnly
                                                    // minTime={this.state.tempStartTime}
                                                    // maxTime={this.state.}
                                                    timeIntervals={30}
                                                    dateFormat="h:mm aa"
                                                    timeCaption="End"
                                                />
                                            </label>
                                            <input type="submit" value="Submit" />
                                        </form>
                                        <button className = 'dd-cancel-button' onClick={this.ddCancelClick}>CANCEL</button>
                                    </div>
                                )
                            }

                        </div>
                    ) : ( null )
                }
            </div>
        );
    }
}

export default EditReservations;
/** @jsx React.DOM */

var React = require('react');

var api = require('../api');

var BarChart = require("./BarChart");
var PollingMixin = require('../mixins/polling');
var TaskSummary = require('./TaskSummary');

var DeployChart = React.createClass({
  mixins: [PollingMixin],

  getInitialState() {
    return {
      loading: true,
      points: [],
    };
  },

  componentWillMount() {
    api.request(this.getPollingUrl(), {
      success: (data) => {
        this.setState({
          points: this.dataToPoints(data),
          loading: false
        });
      }
    });
  },

  getPollingUrl() {
    return '/stats/';
  },

  pollingReceiveData(data) {
    this.setState({
      points: this.dataToPoints(data)
    });
  },

  dataToPoints(data) {
    return data.map((point) => {
      return {x: point[0], y: point[1]};
    });
  },

  render() {
    return (
      <div className="section">
        <BarChart points={this.state.points} label="deploys" />
      </div>
    );
  }
});

var Overview = React.createClass({
  mixins: [PollingMixin],

  getInitialState() {
    return {
      loading: true,
      tasks: [],
    };
  },

  componentWillMount() {
    api.request(this.getPollingUrl(), {
      success: (data) => {
        this.setState({
          loading: false,
          tasks: data
        });
      }
    });
  },

  getPollingUrl() {
    return '/tasks/';
  },

  pollingReceiveData(data) {
    this.setState({
      tasks: data
    });
  },

  taskInProgress(task) {
    return task.status == 'in_progress' || task.status == 'pending';
  },

  render() {
    if (this.state.loading) {
      return <div className="loading" />;
    }

    var activeTaskNodes = this.state.tasks.filter((task) => {
      return this.taskInProgress(task);
    }).map((task) => {
      return (
        <TaskSummary key={task.id} task={task} />
      );
    });

    var previousTaskNodes = this.state.tasks.filter((task) => {
      return !this.taskInProgress(task);
    }).map((task) => {
      return (
        <TaskSummary key={task.id} task={task} />
      );
    });

    return (
      <div>
        <div className="section">
          <div className="section-header">
            <h2>Active Deploys</h2>
          </div>
          {activeTaskNodes.length ?
            <ul className="task-list">
              {activeTaskNodes}
            </ul>
          :
            <p>There are no active tasks.</p>
          }
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Deploy History</h2>
          </div>

          <DeployChart />

          {previousTaskNodes.length ?
            <ul className="task-list">
              {previousTaskNodes}
            </ul>
          :
            <p>There are no historical tasks.</p>
          }
        </div>
      </div>
    );
  }
});

module.exports = Overview;

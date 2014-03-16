(function (window, document, $, ko) {
	function ViewModel() {
		var self = this;
		self.tasks = new TaskListViewModel();

		self.tasks.load();
	}

	function Task(data) {
		var self = this;
		self.isSelected = ko.observable(false);
		self.isStarted = ko.observable(data.isStarted);
		self.isCompleted = ko.observable(data.isCompleted);
		self.title = ko.observable(data.title);

		self.select = function () {
			console.log('click');
			self.isSelected(!self.isSelected());
		};

		self.start = function () {
			self.isStarted(!self.isStarted());
			self.isSelected(false);
		};

		self.complete = function () {
			self.isSelected(false);
			self.isStarted(false);
			self.isCompleted(true);
		};
	}

	function TaskListViewModel() {
		var self = this;

		self.tasks = ko.observableArray();
		self.incompleteTasks = ko.computed(function () {
			return ko.utils.arrayFilter(self.tasks(), function (task) { return !task.isCompleted(); });
		});
		self.completeTasks = ko.computed(function () {
			return ko.utils.arrayFilter(self.tasks(), function (task) { return task.isCompleted(); });
		});
		self.selectedTasks = ko.computed(function () {
			return ko.utils.arrayFilter(self.incompleteTasks(), function (task) { return task.isSelected(); });
		});

		self.selectedTask = ko.computed(function () {
			return ko.utils.arrayFirst(self.incompleteTasks(), function (task) { return task.isSelected(); });
		});

		self.newTask = ko.observable();
		self.newTaskHasFocus = ko.observable(false);

		self.addTask = function () {
			self.tasks.push(new Task({ title: self.newTask(), isStarted: false, isCompleted: false }));

			self.newTask('');
			self.newTaskHasFocus(true);
			save();
		};

		self.start = function () {
			ko.utils.arrayForEach(self.selectedTasks(), function (task) {
				task.start();
			});
			save();
		};

		self.complete = function () {
			ko.utils.arrayForEach(self.selectedTasks(), function (task) {
				task.complete();
			});
			save();
		};

		self.remove = function () {
			self.tasks.removeAll(self.selectedTasks());
			save();
		};

		self.clearCompleted = function () {
			ko.utils.arrayForEach(self.completeTasks(), function (task) { self.tasks.remove(task); });
			save();
		};

		self.load = function () {
			var serializedData = window.localStorage.getItem('day-plan.tasks');
			if (serializedData) {
				var data = JSON.parse(serializedData);
				self.tasks(ko.utils.arrayMap(data, function (item) { return new Task(item); }));
			}
		};

		var save = function () {
			var data = ko.toJSON(self.tasks());
			window.localStorage.setItem('day-plan.tasks', data);
		};

		ko.computed(function () {
			var incompleteCount = self.incompleteTasks().length;
			document.title = 'Day plan' + (incompleteCount > 0 ? (' (' + incompleteCount + ')') : '');
		});
	}

	$(function () { ko.applyBindings(new ViewModel()); });
})(window, document, jQuery, ko);

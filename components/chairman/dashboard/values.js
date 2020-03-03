export const getTotalNoUsers = allUsers => {
  let count = 0;
  allUsers.map(users => {
    count += users.users.length
  });
  return count
};

export const getUsersLabel = allUsers => {
  return ['Student', 'Supervisor', 'UGPC_Member', 'Program_Office', 'Chairman DCSSE', 'Chairman_Office']
};
export const getUsersChartData = allUsers => {
  const students = allUsers.filter(user => user.role === 'Student').length
  const supervisor = allUsers.filter(user => user.role === 'Supervisor').length
  const ugpc_member = allUsers.filter(user => user.additionalRole === 'UGPC_Member').length
  const program_office = allUsers.filter(user => user.role === 'Program_Office').length
  const chairman = allUsers.filter(user => user.role === 'Chairman DCSSE').length
  const chairman_office = allUsers.filter(user => user.role === 'Chairman_Office').length

  return [students,supervisor,ugpc_member,program_office,chairman,chairman_office]
};

export const formatProjectsData = projects => {
  let projectsData = projects.map(project => {
    let totalTasks = project.details.backlog.length;
    let completedTasks = 0;
    project.details.sprint ? project.details.sprint.map(sprint => {
        const todos = sprint.tasks.filter(task => task.status === 'todo').length;
        const inProgress = sprint.tasks.filter(task => task.status === 'inProgress').length;
        const inReview = sprint.tasks.filter(task => task.status === 'inReview').length;
        const done = sprint.tasks.filter(task => task.status === 'done').length;
        if (sprint.status === 'Completed') {
          completedTasks += done;
          totalTasks += done;
        } else {
          totalTasks += todos + inProgress + inReview + done;
        }
      }) :
      completedTasks = 0;
    const percentage = parseFloat(((completedTasks / totalTasks) * 100).toFixed(2));
    return [project._id, project.documentation.visionDocument.title, new Date(project.details.acceptanceLetter.issueDate), new Date(project.details.estimatedDeadline), null, percentage, null]
  });
  const data = [
    [
      {type: 'string', label: 'Project ID'},
      {type: 'string', label: 'Project Title'},
      {type: 'date', label: 'Start Date'},
      {type: 'date', label: 'End Date'},
      {type: 'number', label: 'Duration'},
      {type: 'number', label: 'Percent Complete'},
      {type: 'string', label: 'Dependencies'},
    ],
    ...projectsData
  ];

  return {data, projectsData}
}
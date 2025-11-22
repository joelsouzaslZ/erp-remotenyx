export default function EmployeeStats({ employees }) {
  if (!employees || employees.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Funcionários por Departamento</h3>
        <div className="text-gray-500 text-center py-8">
          Nenhum funcionário encontrado
        </div>
      </div>
    );
  }

  // Group employees by department
  const departmentStats = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Sem Departamento';
    if (!acc[dept]) {
      acc[dept] = { name: dept, count: 0, employees: [] };
    }
    acc[dept].count++;
    acc[dept].employees.push(emp);
    return acc;
  }, {});

  const departments = Object.values(departmentStats);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Funcionários por Departamento</h3>
      <div className="space-y-4">
        {departments.map((dept, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">{dept.name}</h4>
              <p className="text-sm text-gray-500">
                {dept.count} funcionário{dept.count !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="flex -space-x-2">
                {dept.employees.slice(0, 3).map((emp, empIndex) => (
                  <div
                    key={empIndex}
                    className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                    title={emp.name}
                  >
                    {emp.name?.charAt(0) || 'U'}
                  </div>
                ))}
                {dept.employees.length > 3 && (
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium">
                    +{dept.employees.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
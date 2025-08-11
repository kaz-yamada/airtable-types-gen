import { AirtableBaseSchema } from '../../src/types';

export const mockAirtableSchema: AirtableBaseSchema = {
  tables: [
    {
      id: 'tblUsers',
      name: 'Users',
      primaryFieldId: 'fldName',
      description: 'User records',
      fields: [
        {
          id: 'fldName',
          name: 'Name',
          type: 'singleLineText',
        },
        {
          id: 'fldEmail',
          name: 'Email',
          type: 'email',
        },
        {
          id: 'fldAge',
          name: 'Age',
          type: 'number',
        },
        {
          id: 'fldActive',
          name: 'Active',
          type: 'checkbox',
        },
        {
          id: 'fldRole',
          name: 'Role',
          type: 'singleSelect',
          options: {
            choices: [
              { name: 'Admin' },
              { name: 'User' },
              { name: 'Guest' }
            ]
          }
        },
        {
          id: 'fldCreated',
          name: 'Created',
          type: 'createdTime',
        },
        {
          id: 'fldAutoNumber',
          name: 'Auto ID',
          type: 'autoNumber',
        }
      ],
      views: [
        {
          id: 'viwAll',
          name: 'All Users',
          type: 'grid'
        }
      ]
    },
    {
      id: 'tblProjects',
      name: 'Projects',
      primaryFieldId: 'fldProjectName',
      description: 'Project records',
      fields: [
        {
          id: 'fldProjectName',
          name: 'Project Name',
          type: 'singleLineText',
        },
        {
          id: 'fldStatus',
          name: 'Status',
          type: 'multipleSelects',
          options: {
            choices: [
              { name: 'Planning' },
              { name: 'In Progress' },
              { name: 'Completed' }
            ]
          }
        },
        {
          id: 'fldAssignees',
          name: 'Assignees',
          type: 'multipleRecordLinks',
        }
      ],
      views: [
        {
          id: 'viwActive',
          name: 'Active Projects',
          type: 'grid'
        }
      ]
    }
  ]
};
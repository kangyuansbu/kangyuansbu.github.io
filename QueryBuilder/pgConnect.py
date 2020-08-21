import json

import psycopg2


class db():
    refer = {"patients.person_id": "patients.subject_id", "patients.zipcode": "patients.zip_code",
             "encounters.encounter_id": "encounters.encntr_id", "procedures.code": "procedures_icd.code",
             "labevents.item_id": "lab_events.item_id", "labevents.numvalue": "lab_events.result_val_num",
             "apgar_event.item": "apgar_events.item_id", "apgar_event.value": "apgar_events.result_val",
             "apgar_event.time": "apgar_events.time_interval", "apgar_event.baby_no": "apgar_events.result_val_num"}

    operator_dict_int = {"equal": " = ", "not_equal": " <> ",
                         "greater": " > ", "greater_or_equal": " >= ",
                         "less": " < ", "less_or_equal": " <= ",
                         "is_null": " is null", "is_not_null": " is not null ",
                         "between": " BETWEEN ", "not_between": " not BETWEEN "}

    operator_dict_str = {"begins_with": " LIKE '{}%' ", "not_begins_with": " not LIKE '{}%' ",
                         "contains": " LIKE '%{}%' ", "not_contains": " not LIKE '%{}%' ",
                         "ends_with": " LIKE '%{}' ", "not_ends_with": " not LIKE '%{}' ",
                         "equal": " LIKE '{}' ", "not_equal": " not LIKE '{}' ",
                         "is_not_empty": " <> '' ", "is_empty": " = ''",
                         "is_null": " is null ", "is_not_null": " is not null ",
                         "in": " IN ", "not_in": " not IN "}

    schema = ''

    tables = []
    columns = []

    sql_query = ''

    def __init__(self, schema):
        self.schema = schema
        self.columns = []
        self.tables = []
        self.sql_query = ''

    def parse_json(self, condition, rules):

        query_condition = ''

        for rule in rules:
            if 'condition' in rule:
                group = self.parse_json(rule['condition'], rule['rules'])
                query_condition = query_condition + '( ' + group + ' )' + ' ' + condition + ' '
            else:
                field = rule['field']
                operator = rule['operator']
                value = rule['value']
                value_type = rule['type']

                '''Collect fields for select statement'''
                if field in self.refer:
                    column = self.refer[field]
                else:
                    column = field

                if column not in self.columns:
                    self.columns.append(column)

                '''Parse operator + value for where statement'''
                if value_type == 'integer':
                    if value == None:
                        value = ''

                    if operator in ['between', 'not_between']:
                        value = value[0] + ' AND ' + value[1]

                    where_condition = self.operator_dict_int[operator] + value

                elif value_type == 'string':
                    if operator in ["in", "not_in"]:
                        set_in = "("
                        for ele in value.split(','):
                            set_in += "'{}',".format(ele)
                        set_in = set_in[:-1] + ")"

                        where_condition = self.operator_dict_str[operator] + set_in
                    else:
                        where_condition = self.operator_dict_str[operator].format(value)

                elif value_type == 'date':
                    if operator in ['between', 'not_between']:
                        value = value[0] + "'" + ' AND ' + "'" + value[1]
                    value = "'" + value.replace('/', '-') + "'"
                    where_condition = self.operator_dict_int[operator] + value

                elif value_type == 'datetime':
                    # if operator in ['between', 'not_between']:
                    #     value = value[0] + "'" + ' AND ' + "'" + value[1]
                    # value = "'" + value.replace('/', '-') + "'"
                    # where_condition = self.operator_dict_int[operator] + value
                    pass

                query_condition = query_condition + column + where_condition + ' ' + condition + ' '

        query_condition = query_condition[:-4]

        return query_condition

    def parse(self, rules_json, sel_star=True):
        condition = rules_json['condition']
        rules = rules_json['rules']
        query_condition = self.parse_json(condition, rules)

        for column in self.columns:
            table = column.split('.')[0]
            if table not in self.tables:
                self.tables.append(table)

        '''Query 'select' part '''
        if sel_star:
            query_sel = 'select * '
        else:
            query_sel = 'select '
            for column in self.columns:
                query_sel = query_sel + column + ','

            query_sel = query_sel[:-1] + ' '

        '''Query 'join & on' part'''
        join_on = []
        for table in self.tables:
            if table == 'patients':
                join_on.append("patients.subject_id")
            else:
                join_on.append(table + "." + "person_id")

        query_join = 'from ' + self.schema + '.' + self.tables[0] + ' '

        for i in range(1, len(self.tables)):
            query_join = query_join + 'join ' + self.schema + '.' + self.tables[i] + ' on ' + join_on[i] + ' = ' + \
                         join_on[0] + ' '

        '''Query 'where' part'''
        query_where = 'where ' + query_condition

        '''Combine three parts'''
        self.sql_query = query_sel + query_join + query_where + ';'

        return self.sql_query

    def get_data(self, rules_json, database, user, password, host, port):

        conn = psycopg2.connect(database=database, user=user, password=password, host=host, port=port)

        cursor = conn.cursor()

        self.parse(rules_json)
        print("SQL_QUERY:", self.sql_query)
        print()

        cursor.execute(self.sql_query)

        header = [cursor.description[i].name for i in range(len(cursor.description))]

        data = cursor.fetchmany(50)
        # data = cursor.fetchall()

        data_json = self.data_to_json(data, header)

        conn.commit()
        cursor.close()
        conn.close()

        return data_json

    def data_to_json(self, data, header):
        jsonData = []

        for row in data:
            row_json = {}
            for i in range(len(header)):
                row_json[header[i]] = str(row[i])
            jsonData.append(row_json)

        jsonData = json.dumps(jsonData)

        return jsonData

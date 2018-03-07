package main

import (
	_ "github.com/Go-SQL-Driver/MySQL"
	"database/sql"
	"fmt"
	"os"
)

type Person struct {
	uid           sql.NullInt64
	username      sql.NullString
	email         sql.NullString
	password_hash sql.NullString
	confirmed     sql.NullInt64
}

var (
	db, err = sql.Open("mysql", "root:123456@/py?charset=utf8")
)

func main() {
	//add
	/*sql := "insert user set username=?,email=?"
	params := []string{"tom2", "tom_gooo2@163.com"}
	fmt.Println(add(sql, params))*/
	//delete
	fmt.Println(delete(6))
	//update
	sql := "update user set username=? where id=?"
	params := []string{"tom_update", "2"}
	fmt.Println(update(sql, params))
	//select
	query()
}
func update(sql string, params []string) int64 {
	stmt, err := db.Prepare(sql)
	checkErr(err)
	res, err := stmt.Exec(params[0], params[1])
	checkErr(err)
	id, err := res.RowsAffected()
	return id
}
func add(sql string, params []string) int64 {
	stmt, err := db.Prepare(sql)
	checkErr(err)
	res, err := stmt.Exec(params[0], params[1])
	checkErr(err)
	id, err := res.LastInsertId()
	return id
}

func delete(id int64) int64 {
	stmt, err := db.Prepare("delete from user where id=?")
	checkErr(err)
	res, err := stmt.Exec(id)
	checkErr(err)
	id2, err := res.RowsAffected()
	return id2
}
func query() {
	fmt.Println("query========")
	sql2 := "select * from user "
	rows, err := db.Query(sql2)
	checkErr(err)
	p := new(Person)
	for rows.Next() {
		err = rows.Scan(&p.uid, &p.username, &p.email, &p.password_hash, &p.confirmed)
		checkErr(err)
		fmt.Println(p)
	}
}
func checkErr(err error) {
	if err != nil {
		fmt.Println("Error is ", err)
		os.Exit(-1)
	}
}

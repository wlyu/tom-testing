package main

import (
	"fmt"
	_ "github.com/Go-SQL-Driver/MySQL"//_ ===》invoke init()
	"github.com/jmoiron/sqlx"
	"database/sql"
	"errors"
	"os"
)

func main() {
	//-insert
	save()
	//-delete
	//-update
	//-select
	//--1 single
	selectSingle1()
	selectSingle2()
	testTransaction()
	//--2 list
	//--3 listPage
	//-transaction

}

type Person struct {
	Id int
}

const (
	database1      = "py"
	database2      = "test"
	dataSourceName = "root:123456@(localhost:3306)/" + database1
)

var (
	db, err = sqlx.Connect("mysql", dataSourceName)
)

func init() {
	if err != nil {
		connectError := err.Error()
		errors.New(connectError)
		panic(connectError)
		fmt.Println(err)
		os.Exit(-1)
	}

}
func save() {
	sqlRes, err := db.NamedExec("insert into test.heros(`name`) values(:myName)",
		map[string]interface{}{
			"myName": "tom",
		})
	if err == nil {
		fmt.Println(sqlRes.RowsAffected())
	} else {
		fmt.Println(err)
	}
	sql := "insert into test.user2(`email`, `username`, `password_hash`, `confirmed`) values(:email,:username,:password_hash,:confirmed)";
	//映射是按照reflect的数组顺序
	sql = "insert into test.user2( `username`,`email`, `password_hash`, `confirmed`) values(:username,:email,:password_hash,:confirmed)";
	user := User{0, "tom", "tom@163.com", "1~w9", 1}
	sqlRes2, err2 := db.NamedExec(sql, user)
	if err2 == nil {
		fmt.Println(sqlRes2.RowsAffected())
	} else {
		fmt.Println(err2)
	}
}
func selectSingle1() {

	p := Person{}
	err2 := db.QueryRowx("SELECT id FROM test LIMIT 1").StructScan(&p)
	if err2 == nil {
		fmt.Println(p)
	} else {
		fmt.Println(err2)
		return
	}
}

type User struct {
	Id            int64  `db:"id"`
	Username      string `db:"username"`
	Email         string `db:"email"`
	Password_hash string `db:"password_hash"`
	Confirmed     int8   `db:"confirmed"`
}
type User2 struct {
	Id            sql.NullInt64
	Username      sql.NullString
	Email         sql.NullString
	Password_hash sql.NullString
	Confirmed     sql.NullInt64
}

func selectSingle2() {
	//db, err := sqlx.Connect("mysql", dataSourceName)
	//defer db.Close()
	if err != nil {
		fmt.Println(err)
		return
	}
	p := []User{}
	err2 := db.Select(&p, "SELECT * FROM "+database2+".user2 LIMIT 1")
	if err2 == nil {
		fmt.Println(p)
		if len(p) > 0 {
			fmt.Println(p[0].Email)
		}

	} else {
		fmt.Println(err2)
		return
	}

}

func testTransaction() {
	//db, err := sqlx.Connect("mysql", dataSourceName)
	//defer db.Close()
	if err != nil {
		fmt.Println(err)
		return
	}

	tx := db.MustBegin();
	tx.MustExec("update test.user2 set email= ? where id =?", "1", 1)
	panic("有一个panic")
	tx.MustExec("update test.user2 set email= ? where id =?", "2", 1)
	tx.Commit();
}

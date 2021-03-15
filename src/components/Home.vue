<template>
  <div>
    <navbar-component></navbar-component>
    <div class="d-flex">
      <div class="content p-4">
        <div class="row mb-4">
          <div class="col-md">
            <div class="d-flex border">
              <div class="flex-grow-1 bg-white p-4">
                <div class="list row">
                  <div class="col-md-2 dropdown-wrapper">
                    <div>
                      <b-form-select
                        v-model="selected"
                        :options="options"
                        class="mb-3"
                        v-on:change="getSelectedItem"
                      >
                        <template>
                          <b-form-select-option :value="null" disabled
                            >-- Search by --</b-form-select-option
                          >
                        </template>
                      </b-form-select>
                    </div>
                  </div>

                  <div class="col-md-8">
                    <div class="input-group mb-3">
                      <b-input-group-prepend is-text>
                        <b-icon icon="search"></b-icon>
                      </b-input-group-prepend>
                      <input
                        type="text"
                        class="form-control"
                        :placeholder="myplaceholder"
                        v-model="searchTitle"
                      />
                      <div class="input-group-append">
                        <button
                          class="btn btn-outline-secondary"
                          type="button"
                          @click="
                            page = 1;
                            retrieveBooks();
                          "
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="list row">
                  <div class="col-md-4">
                    <b-card-group deck>
                      <b-table
                        :fields="fields"
                        head-variant="light"
                        class="sortBtn"
                      >
                        <template v-slot:head(heading1)="data">
                          <span
                            class="btn sortSpan"
                            v-html="data.label"
                            variant="light"
                            @click="changeSortType((sortType = !sortType))"
                          ></span>
                        </template>
                      </b-table>
                      <!-- <div>{{ sortType }}</div> -->
                      <b-card>
                        <b-list-group
                          v-if="books.length > 0"
                          class="item-align-left"
                        >
                          <b-list-group-item
                            v-for="(book, index) in books"
                            :class="{ active: index == currentIndex }"
                            :key="index"
                            @click="setActiveBook(book, index)"
                            href="#"
                            >{{ book.title }}</b-list-group-item
                          >
                        </b-list-group>
                        <b-list-group v-else>
                          <b-list-group-item>No data</b-list-group-item>
                        </b-list-group>
                      </b-card>
                    </b-card-group>
                    <div class="txt-left">
                      <button
                        v-if="books.length > 0"
                        class="m-3 btn btn-sm btn-danger ml-auto"
                        @click="removeAllBooks"
                      >
                        Remove All
                      </button>
                      <button
                        v-else
                        class="m-3 btn btn-sm btn-danger ml-auto"
                        disabled
                        @click="removeAllBooks"
                      >
                        Remove All
                      </button>
                    </div>
                  </div>

                  <div class="col-md-8">
                    <div v-if="currentBook">
                      <b-card-group deck>
                        <b-card header="DETAILED BOOK">
                          <div class="item-align-left">
                            <label><strong>Title:</strong></label>
                            {{ currentBook.title }}
                          </div>
                          <div class="item-align-left">
                            <label><strong>Description:</strong></label>
                            {{ currentBook.description }}
                          </div>
                          <div class="item-align-left">
                            <label><strong>Status:</strong></label>
                            {{ currentBook.published }}
                          </div>
                          <div>
                            <img
                              v-bind:src="currentBook.data"
                              width="150px"
                              height="200px"
                              alt=""
                            />
                          </div>
                          <br />
                          <router-link
                            v-bind:to="'/books/' + currentBook.id"
                            active-class="active"
                            tag="button"
                            >Edit</router-link
                          >
                        </b-card>
                      </b-card-group>
                    </div>
                    <div v-else>
                      <br />
                      <p>Please click on a Book...</p>
                    </div>
                  </div>
                </div>
                <br />
                <div class="list row">
                  <div class="col-md-2">
                    <div class="mt-2">
                      Items per Page:
                      <select
                        v-model="pageSize"
                        @change="handlePageSizeChange($event)"
                      >
                        <option
                          v-for="size in pageSizes"
                          :key="size"
                          :value="size"
                        >
                          {{ size }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-8">
                    <b-pagination
                      v-model="page"
                      :total-rows="count"
                      :per-page="pageSize"
                      prev-text="Prev"
                      next-text="Next"
                      @change="handlePageChange"
                    ></b-pagination>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserInfoStore from "../app/user-info-store";
import BookDataService from "../services/BookDataService";

export default {
  name: "Home",
  data() {
    return {
      userPoolId: process.env.VUE_APP_COGNITO_USERPOOL_ID,
      userInfo: UserInfoStore.state.cognitoInfo,

      sortType: null,

      books: [],
      currentBook: null,
      currentIndex: -1,
      searchTitle: "",
      myplaceholder: "Enter here ...",

      page: 1,
      count: 0,
      pageSize: 15,
      pageSizes: [15, 20, 30],

      selected: null,
      options: [
        { value: "title", text: "Title" },
        { value: "author", text: "Author" },
      ],

      fields: [{ key: "heading1", label: "<i>BOOKS LIST</i>", sortable: true }],
    };
  },

  methods: {
    changeSortType(sortType) {
      this.sortType = sortType;
      // this.retrieveBooks();
    },

    getRequestParams(sort, selected, searchTitle, page, pageSize) {
      let params = {};

      if (selected) {
        params["selected"] = selected;
      }
      if (searchTitle) {
        params["title"] = searchTitle;
      }
      if (page) {
        params["page"] = page - 1;
      }
      if (pageSize) {
        params["size"] = pageSize;
      }

      return params;
    },

    getSelectedItem: function (myarg) {
      this.myplaceholder = "Search by " + myarg;
      this.searchTitle = "";
    },

    retrieveBooks() {
      const params = this.getRequestParams(
        this.sort,
        this.selected,
        this.searchTitle,
        this.page,
        this.pageSize
      );

      BookDataService.getAll(params)
        .then((response) => {
          const { books, totalItems } = response.data;
          this.books = books.map(this.getDisplayBook);
          this.count = totalItems;

          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    handlePageChange(value) {
      this.page = value;
      this.retrieveBooks();
    },

    handlePageSizeChange(event) {
      this.pageSize = event.target.value;
      this.page = 1;
      this.retrieveBooks();
    },

    refreshList() {
      this.retrieveBooks();
      this.currentBook = null;
      this.currentIndex = -1;
    },

    getDisplayBook(book) {
      return {
        id: book.id,
        title:
          book.title.length <= 50
            ? book.title
            : book.title.substr(0, 50) + "...",
        author: book.author,
        description:
          book.description.length <= 150
            ? book.description
            : book.description.substr(0, 150) + "...",
        published: book.published ? "Published" : "Pending",
        image: book.image,
      };
    },

    setActiveBook(book, index) {
      book.data = "data:image/jpeg;base64," + book.image;
      this.currentBook = book;
      this.currentIndex = index;
    },

    removeAllBooks() {
      if (confirm("Are you sure you want to delete all items?")) {
        BookDataService.deleteAll()
          .then((response) => {
            console.log(response.data);
            this.refreshList();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },
  },
  mounted() {
    this.retrieveBooks();
  },
};
</script>

<style>
@import "../css/dashmin.css";
</style>

<style scoped>
.txt-left {
  text-align: left;
}
#ddCommodity {
  margin-top: 0 !important;
}
.dropdown-wrapper {
  text-align: right;
}
.sortBtn {
  margin: 0px 15px 0px 15px;
}
.sortSpan {
  width: 100%;
}
.item-align-left {
  text-align: left;
}
</style>
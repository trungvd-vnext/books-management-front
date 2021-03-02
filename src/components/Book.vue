<template>
  <div>
    <navbar-component></navbar-component>
    <div class="d-flex">
      <div class="content p-4">
        <div class="row mb-4">
          <div class="col-md">
            <div class="d-flex border">
              <div class="flex-grow-1 bg-white p-4">
                <div v-if="currentBook" class="edit-form">
                  <h4>Book</h4>
                  <form>
                    <div class="form-group">
                      <label for="title">Title</label>
                      <input
                        type="text"
                        class="form-control"
                        id="title"
                        v-model="currentBook.title"
                      />
                    </div>
                    <div class="form-group">
                      <label for="author">Author</label>
                      <input
                        type="text"
                        class="form-control"
                        id="author"
                        v-model="currentBook.author"
                      />
                    </div>
                    <div class="form-group">
                      <label for="description">Description</label>
                      <input
                        type="text"
                        class="form-control"
                        id="description"
                        v-model="currentBook.description"
                      />
                    </div>

                    <div class="form-group">
                      <label><strong>Status:</strong></label>
                      {{ currentBook.published ? "Published" : "Pending" }}
                    </div>
                  </form>

                  <button
                    class="badge badge-primary mr-2"
                    v-if="currentBook.published"
                    @click="updatePublished(false)"
                  >
                    UnPublish
                  </button>
                  <button
                    v-else
                    class="badge badge-primary mr-2"
                    @click="updatePublished(true)"
                  >
                    Publish
                  </button>

                  <button class="badge badge-danger mr-2" @click="deleteBook">
                    Delete
                  </button>

                  <button
                    type="submit"
                    class="badge badge-success"
                    @click="updateBook"
                  >
                    Update
                  </button>
                  <p>{{ message }}</p>
                </div>

                <div v-else>
                  <br />
                  <p>Please click on a Book...</p>
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
import BookDataService from "../services/BookDataService";

export default {
  name: "book",
  data() {
    return {
      currentBook: null,
      message: "",
    };
  },
  methods: {
    getBook(id) {
      BookDataService.get(id)
        .then((response) => {
          this.currentBook = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    updatePublished(status) {
      var data = {
        id: this.currentBook.id,
        title: this.currentBook.title,
        author: this.currentBook.author,
        description: this.currentBook.description,
        published: status,
      };

      BookDataService.update(this.currentBook.id, data)
        .then((response) => {
          this.currentBook.published = status;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    updateBook() {
      BookDataService.update(this.currentBook.id, this.currentBook)
        .then((response) => {
          console.log(response.data);
          this.message = "The book was updated successfully!";
        })
        .catch((e) => {
          console.log(e);
        });
    },

    deleteBook() {
      BookDataService.delete(this.currentBook.id)
        .then((response) => {
          console.log(response.data);
          this.$router.push({ name: "Home" });
        })
        .catch((e) => {
          console.log(e);
        });
    },
  },
  mounted() {
    this.message = "";
    this.getBook(this.$route.params.id);
  },
};
</script>

<style>
.edit-form {
  max-width: 300px;
  margin: auto;
}
</style>
